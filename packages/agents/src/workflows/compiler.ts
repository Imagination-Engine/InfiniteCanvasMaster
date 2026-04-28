import { Workflow, createStep } from "@mastra/core/workflows";
import {
  blockRegistry,
  messageBus,
  Topics,
  BALNCE_A2A_PROTOCOL,
  BALNCE_A2A_VERSION,
  NodeInputAdapterRegistry,
  DefaultStrictInputAdapter,
  LegacyAdditionalInstructionsAdapter,
} from "@iem/core";
import { z } from "zod";
import crypto from "crypto";

export type CompileWorkflowOptions = {
  messageFabric?: any;
  adapterRegistry?: NodeInputAdapterRegistry;
  runId?: string;
};

export function compileGraphToWorkflow(
  graph: { nodes: any[]; edges: any[] },
  options: CompileWorkflowOptions = {},
) {
  const runId = options.runId || Date.now().toString();
  const fabric = options.messageFabric || messageBus;
  const registry = options.adapterRegistry || new NodeInputAdapterRegistry();

  // Ensure default adapters are present if none registered
  if (!(registry as any).defaultAdapter) {
    registry.registerDefault(new LegacyAdditionalInstructionsAdapter());
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
            // Mastra returns the step result, which we've wrapped in an envelope
            envelopes.push(result);
          }
        }

        // Add trigger data if it's an envelope
        const triggerData = getInitData();
        if (incomingEdges.length === 0 && triggerData) {
          if (triggerData.protocol === BALNCE_A2A_PROTOCOL) {
            envelopes.push(triggerData);
          }
        }

        // Use Adapter Registry instead of universal mutation
        const baseInput = { ...(node.data?.inputs || node.data?.params || {}) };
        const adaptedInput = await registry.adapt({
          envelopes,
          baseInput,
          nodeSpec: node,
          runContext: { runId },
        });

        // Validate
        const validatedInput = blockDef.input.parse(adaptedInput);

        // Execute block
        const rawOutput = await blockDef.agent.invoke(validatedInput);
        const parsedOutput = blockDef.output.parse(rawOutput);

        // Wrap the output in a BalnceEnvelope complying with the new protocol
        const envelope = {
          protocol: BALNCE_A2A_PROTOCOL,
          version: BALNCE_A2A_VERSION,
          id: crypto.randomUUID(),
          traceId: runId,
          runId: runId,
          source: { type: "block", id: node.id },
          event: {
            type: "node.output",
            sequence: 0, // In a real system, we'd increment this
            timestamp: new Date().toISOString(),
          },
          payload: parsedOutput,
          debug: {
            compilerNodeId: node.id,
            mastraWorkflowId: `canvas-workflow-${runId}`,
          },
        };

        // Publish to the Message Fabric
        await fabric.publish(Topics.dagNodeOutput(runId, node.id), envelope);

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
