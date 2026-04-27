import { Workflow, createStep } from "@mastra/core/workflows";
import {
  blockRegistry,
  messageBus,
  wrapInEnvelope,
  serializeEnvelope,
} from "@iem/core";
import { z } from "zod";

export function compileGraphToWorkflow(graph: { nodes: any[]; edges: any[] }) {
  const runId = Date.now().toString();
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
        // Gather inputs from previous steps based on graph edges
        const incomingEdges = graph.edges.filter(
          (e: any) => e.target === node.id || e.targetId === node.id,
        );

        let mergedInput = { ...(node.data?.inputs || node.data?.params || {}) };
        let mergedContext = {};
        let incomingInstructions: string[] = [];

        // Merge outputs from upstream dependencies (unwrapping the BalnceEnvelope)
        for (const edge of incomingEdges) {
          const sourceId = edge.source || edge.sourceId;
          const sourceEnvelope = getStepResult(sourceId);
          if (sourceEnvelope) {
            // Assume sourceEnvelope is a BalnceEnvelope
            if (sourceEnvelope.payload) {
              mergedInput = { ...mergedInput, ...sourceEnvelope.payload };
            } else {
              // Fallback if upstream wasn't an envelope (e.g. legacy block)
              mergedInput = { ...mergedInput, ...sourceEnvelope };
            }
            if (sourceEnvelope.context) {
              mergedContext = { ...mergedContext, ...sourceEnvelope.context };
            }
            if (sourceEnvelope.instruction) {
              incomingInstructions.push(sourceEnvelope.instruction);
            }
          }
        }

        // If this is a root node (no incoming edges), merge in the triggerData
        const triggerData = getInitData();
        if (incomingEdges.length === 0 && triggerData) {
          // Unwrap if the trigger data is an envelope
          if (triggerData.payload) {
            mergedInput = { ...mergedInput, ...(triggerData.payload as any) };
            mergedContext = {
              ...mergedContext,
              ...((triggerData.context as any) || {}),
            };
          } else {
            mergedInput = { ...mergedInput, ...(triggerData as any) };
          }
        }

        // Validate first so strict schemas don't fail on injected A2A fields
        const validatedInput = blockDef.input.parse(mergedInput);

        // Optional: Provide the collected context and instructions to the block's generative capability.
        // We inject it softly AFTER validation so blocks that support it can use it, while strict schema blocks ignore it
        // during parsing but might still receive it in their underlying tool implementation.
        if (typeof validatedInput === "object" && validatedInput !== null) {
          if (incomingInstructions.length > 0) {
            if (!("additionalInstructions" in validatedInput)) {
              (validatedInput as any).additionalInstructions =
                incomingInstructions.join("\\n");
            }
            (validatedInput as any)._instructions =
              incomingInstructions.join("\\n");
          }
          if (Object.keys(mergedContext).length > 0) {
            if (!("context" in validatedInput)) {
              (validatedInput as any).context = JSON.stringify(mergedContext);
            }
            (validatedInput as any)._context = mergedContext;
          }
        }

        const rawOutput = await blockDef.agent.invoke(validatedInput);
        const parsedOutput = blockDef.output.parse(rawOutput);

        // Wrap the output in a BalnceEnvelope
        const envelope = wrapInEnvelope({
          traceId: runId,
          sourceId: node.id,
          context: mergedContext, // Pass context downstream
          payload: parsedOutput,
        });

        // Publish to the native Message Bus
        messageBus.publish(
          `dag.${runId}.block.${node.id}.output`,
          serializeEnvelope(envelope),
        );

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
