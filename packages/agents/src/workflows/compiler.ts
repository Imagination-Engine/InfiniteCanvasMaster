import { Workflow, createStep } from "@mastra/core/workflows";
import {
  blockRegistry,
  messageBus,
  // @ts-ignore
  NodeInputAdapterRegistry,
  // @ts-ignore
  DefaultStrictInputAdapter,
  // @ts-ignore
  LegacyAdditionalInstructionsAdapter,
  // @ts-ignore
  createEnvelope,
  // @ts-ignore
  FabricTopics,
} from "@iem/core";
import { z } from "zod";
import crypto from "crypto";

export type CompileWorkflowOptions = {
  messageFabric?: any;
  adapterRegistry?: any; // Cast to any
  runId?: string;
};

export function compileGraphToWorkflow(
  graph: { nodes: any[]; edges: any[] },
  options: CompileWorkflowOptions = {},
) {
  const runId = options.runId || Date.now().toString();
  const fabric = options.messageFabric || messageBus;
  // @ts-ignore
  const registry = options.adapterRegistry || new NodeInputAdapterRegistry();

  // Ensure default adapters are present if none registered
  if (!(registry as any).defaultAdapter) {
    // @ts-ignore
    registry.registerDefault(new DefaultStrictInputAdapter());
  }

  const workflow = new Workflow({
    id: `canvas-workflow-${runId}`,
    inputSchema: z.record(z.string(), z.any()).optional(),
    outputSchema: z.any(),
  });

  const steps = new Map();

  // 1. Define all steps dynamically
  for (const node of graph.nodes) {
    const blockDef = blockRegistry.get(node.type || node.blockId);
    if (!blockDef) {
      console.warn(
        `Block definition not found for node type: ${node.type || node.blockId}`,
      );
      continue;
    }

    const step = createStep({
      id: node.id,
      description: blockDef.description || "Canvas Block",
      inputSchema: z.any(),
      outputSchema: z.any(),
      execute: async ({
        inputData,
        mastra,
        getStepResult,
        getInitData,
      }: any) => {
        // Collect upstream envelopes
        const incomingEdges = graph.edges.filter(
          (e: any) => e.target === node.id || e.targetId === node.id,
        );

        const envelopes: any[] = [];

        // Fetch envelopes from Mastra step results
        for (const edge of incomingEdges) {
          const sourceId = edge.source || edge.sourceId;
          const result = getStepResult(sourceId);
          if (result) {
            envelopes.push(result);
          }
        }

        // Add trigger data if it's an envelope
        const triggerData = getInitData();
        if (incomingEdges.length === 0 && triggerData) {
          if (triggerData.protocol === "balnce.fabric") {
            envelopes.push(triggerData);
          }
        }

        // Use Adapter Registry instead of universal mutation
        const baseInput = { ...(node.data?.inputs || node.data?.params || {}) };
        const adaptedInput = await registry.adapt({
          envelopes,
          baseInput,
          nodeSpec: node,
          traceId: runId, // Using runId as traceId for now
        });

        // Validate
        const validatedInput = blockDef.input.parse(adaptedInput);

        // Execute block
        const rawOutput = await blockDef.agent.invoke(validatedInput);
        const parsedOutput = blockDef.output.parse(rawOutput);

        // Wrap the output in a BalnceEnvelope v2
        // @ts-ignore
        const envelope = createEnvelope({
          lane: "agent_stream",
          traceId: runId,
          runId: runId,
          source: {
            type: "block",
            id: node.id,
            // @ts-ignore
            topic: FabricTopics.workflowNodeOutput(runId, node.id),
          },
          event: {
            type: "node.output",
          },
          delivery: { class: "replayable" },
          payload: parsedOutput,
        });

        // Publish to the Message Fabric
        await fabric.publish(envelope);

        return envelope;
      },
    });

    steps.set(node.id, step);
  }

  // 2. Build the DAG using topological sorting
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();

  graph.nodes.forEach((n: any) => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });

  graph.edges.forEach((e: any) => {
    const sourceId = e.source || e.sourceId;
    const targetId = e.target || e.targetId;
    if (outEdges.has(sourceId)) {
      outEdges.get(sourceId)!.push(targetId);
    }
    if (inDegree.has(targetId)) {
      inDegree.set(targetId, inDegree.get(targetId)! + 1);
    }
  });

  const queue: string[] = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0 && steps.has(id)) {
      queue.push(id);
    }
  }

  let wfBuilder: any = workflow;
  let isFirst = true;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentStep = steps.get(currentId);

    if (currentStep) {
      if (isFirst) {
        wfBuilder = wfBuilder.step(currentStep);
        isFirst = false;
      } else {
        wfBuilder = wfBuilder.then(currentStep);
      }
    }

    for (const neighbor of outEdges.get(currentId) || []) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  wfBuilder.commit();
  return workflow;
}
