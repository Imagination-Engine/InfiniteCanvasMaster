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
  // @ts-ignore
  VideoStudioInputAdapter,
  // @ts-ignore
  ProgrammerInputAdapter,
  // @ts-ignore
  normalizeCanvasBlockId,
} from "@iem/core";
import { z } from "zod";
import crypto from "crypto";

export type CompileWorkflowOptions = {
  messageFabric?: any;
  adapterRegistry?: any; // Cast to any
  runId?: string;
  mastra?: any;
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

    // Register specialized adapters
    registry.register(new VideoStudioInputAdapter());
    registry.register(new ProgrammerInputAdapter());
  }

  const workflow = new Workflow({
    mastra: options.mastra,
    id: `canvas-workflow-${runId}`,
    inputSchema: z.record(z.string(), z.any()).optional(),
    outputSchema: z.any(),
  });

  const steps = new Map();

  // 1. Define all steps dynamically
  for (const node of graph.nodes) {
    const rawType = node.type || node.blockId;
    const normalizedType = normalizeCanvasBlockId(rawType);
    let blockDef = blockRegistry.get(normalizedType);

    if (!blockDef) {
      console.warn(
        `Block definition not found for node type: ${rawType} (normalized: ${normalizedType}). Creating pass-through step.`,
      );
      const step = createStep({
        id: node.id,
        description: "Pass-through Canvas Block",
        execute: async () => ({
          success: true,
          warning: "Pass-through execution due to missing block def.",
        }),
      });
      steps.set(node.id, step);
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

        // --- PROMPT MAPPING FALLBACK ---
        // If the block expects a 'prompt' but it's missing in inputs,
        // fall back to the node's description (where the AI Architect puts instructions).
        const description = node.data?.description || node.description || "";

        // Universal mapping: many blocks use different names for the primary input
        baseInput.prompt = baseInput.prompt ?? description;
        baseInput.text = baseInput.text ?? description;
        baseInput.goal = baseInput.goal ?? description;
        baseInput.payload = baseInput.payload ?? description;
        baseInput.content =
          baseInput.payload ?? baseInput.content ?? description;

        // Game-specific fallbacks to prevent Zod Required errors
        baseInput.condition = baseInput.condition ?? description;
        baseInput.action = baseInput.action ?? description;
        baseInput.asset = baseInput.asset ?? description;
        baseInput.entityType = baseInput.entityType ?? description;
        baseInput.mapping = baseInput.mapping ?? {};

        // Defensive: ensure these are at least empty strings if they exist as keys but are null/undefined
        // This prevents Zod "Required" errors for common fields.
        if (baseInput.prompt === undefined || baseInput.prompt === null)
          baseInput.prompt = "";
        if (baseInput.text === undefined || baseInput.text === null)
          baseInput.text = "";
        if (baseInput.goal === undefined || baseInput.goal === null)
          baseInput.goal = "";
        if (baseInput.condition === undefined || baseInput.condition === null)
          baseInput.condition = "";
        if (baseInput.action === undefined || baseInput.action === null)
          baseInput.action = "";
        if (baseInput.asset === undefined || baseInput.asset === null)
          baseInput.asset = "";
        if (baseInput.entityType === undefined || baseInput.entityType === null)
          baseInput.entityType = "";

        const adaptedInput = await registry.adapt({
          envelopes,
          baseInput,
          nodeSpec: node,
          traceId: runId,
        });

        // Defensive: ensure these are at least empty strings if they are missing after adaptation
        if (adaptedInput.prompt === undefined || adaptedInput.prompt === null) {
          adaptedInput.prompt = baseInput.prompt || description || "";
        }
        if (adaptedInput.text === undefined || adaptedInput.text === null) {
          adaptedInput.text = baseInput.text || description || "";
        }
        if (adaptedInput.goal === undefined || adaptedInput.goal === null) {
          adaptedInput.goal = baseInput.goal || description || "";
        }

        // Ensure the description is also passed in the adapted input if not already there
        if (description && !adaptedInput.description) {
          adaptedInput.description = description;
        }

        // Validate
        let validatedInput;
        try {
          const inputKeys = Object.keys(adaptedInput);
          console.log(
            `[WORKFLOW EXECUTION] Validating input for ${node.id} (${blockDef.id}). Keys: ${inputKeys.join(", ")}. Prompt value type: ${typeof adaptedInput.prompt}`,
          );

          validatedInput = blockDef.input.parse(adaptedInput);
        } catch (err: any) {
          console.error(
            `[WORKFLOW VALIDATION ERROR] Node: ${node.id}, Block: ${blockDef.id}`,
            {
              error: err.errors || err.message,
              receivedData: adaptedInput,
              schemaKeys:
                blockDef.input instanceof z.ZodObject
                  ? Object.keys(blockDef.input.shape)
                  : "unknown",
            },
          );
          throw err;
        }

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

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentStep = steps.get(currentId);

    if (currentStep) {
      wfBuilder = wfBuilder.then(currentStep);
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
