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

  // Preprocess nodes and edges for subgraph calling
  const compiledEdges = (graph.edges || []).map((e) => ({ ...e }));

  // Helper to find all nodes reachable from a start node via current compiledEdges
  const getReachableFrom = (startId: string) => {
    const visited = new Set<string>();
    const q = [startId];
    while (q.length > 0) {
      const curr = q.shift()!;
      if (visited.has(curr)) continue;
      visited.add(curr);
      const outgoing = compiledEdges.filter(
        (e) => (e.source || e.sourceId) === curr,
      );
      for (const edge of outgoing) {
        q.push(edge.target || edge.targetId);
      }
    }
    return visited;
  };

  // Find call nodes and patch
  for (const node of graph.nodes) {
    const type = node.type || node.blockId;
    if (type === "iem.conductor.subGraph" || type === "conductor.subGraph") {
      const subGraphId =
        node.data?.inputs?.subGraphId ||
        node.data?.params?.subGraphId ||
        node.data?.inputs?.graphId ||
        node.data?.params?.graphId;
      if (!subGraphId) continue;

      // Find target head
      const targetHead = graph.nodes.find((n) => {
        const nType = n.type || n.blockId;
        return (
          (nType === "iem.conductor.subGraphHead" ||
            nType === "conductor.subGraphHead") &&
          (n.id === subGraphId ||
            n.data?.inputs?.name === subGraphId ||
            n.data?.params?.name === subGraphId)
        );
      });

      if (targetHead) {
        // 1. Add virtual call edge from Call node to Head node
        compiledEdges.push({
          id: `virtual-call-${node.id}-${targetHead.id}`,
          source: node.id,
          sourceId: node.id,
          target: targetHead.id,
          targetId: targetHead.id,
        });

        // 2. Find reachable nodes in the subgraph
        const subgraphNodes = getReachableFrom(targetHead.id);

        // 3. Find leaf nodes in this subgraph
        const leafNodes: string[] = [];
        for (const sgNodeId of subgraphNodes) {
          const outgoingEdges = compiledEdges.filter(
            (e) => (e.source || e.sourceId) === sgNodeId,
          );
          const hasOutgoingInSubgraph = outgoingEdges.some((e) =>
            subgraphNodes.has(e.target || e.targetId),
          );
          if (!hasOutgoingInSubgraph) {
            leafNodes.push(sgNodeId);
          }
        }

        // 4. Find all targets of the Call node
        const callTargets = compiledEdges.filter(
          (e) =>
            (e.source || e.sourceId) === node.id &&
            (e.target || e.targetId) !== targetHead.id,
        );

        // 5. Connect leaf nodes to the call targets and remove the direct call -> target edges
        for (const callTargetEdge of callTargets) {
          const targetId = callTargetEdge.target || callTargetEdge.targetId;
          // Remove direct edge
          const idx = compiledEdges.indexOf(callTargetEdge);
          if (idx > -1) {
            compiledEdges.splice(idx, 1);
          }
          // Add virtual return edges from all leaf nodes to this target
          for (const leafId of leafNodes) {
            compiledEdges.push({
              id: `virtual-return-${leafId}-${targetId}`,
              source: leafId,
              sourceId: leafId,
              target: targetId,
              targetId: targetId,
              sourceHandle: callTargetEdge.sourceHandle,
              targetHandle: callTargetEdge.targetHandle,
              data: callTargetEdge.data,
            });
          }
        }
      }
    }
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
        const incomingEdges = compiledEdges.filter(
          (e: any) => e.target === node.id || e.targetId === node.id,
        );

        let shouldSkip = false;
        const envelopes: any[] = [];

        console.log(
          `[WORKFLOW EXEC] Executing step ${node.id} (${node.type || node.blockId})`,
        );

        // Fetch envelopes from Mastra step results and check for skip conditions
        for (const edge of incomingEdges) {
          const sourceId = edge.source || edge.sourceId;
          const result = getStepResult(sourceId);
          console.log(
            `  - Incoming edge from ${sourceId} (handle: ${edge.sourceHandle || edge.data?.fromHandleId})`,
          );
          if (result) {
            console.log(
              `    - Parent result payload:`,
              JSON.stringify(result.payload),
            );
            // If the parent was skipped, this step must also be skipped
            if (result.payload?.status === "skipped") {
              shouldSkip = true;
              console.log(
                `    - Parent was skipped, triggering skip for current step.`,
              );
            }

            // If parent is an IF block, verify the branch matches this edge's source handle
            const parentNode = graph.nodes.find((n: any) => n.id === sourceId);
            const parentType = parentNode
              ? parentNode.type || parentNode.blockId
              : null;
            if (parentType === "iem.conductor.if") {
              const activeBranch = result.payload?.branch; // e.g. "truePath" or "falsePath"
              const edgeHandle = edge.sourceHandle || edge.data?.fromHandleId; // e.g. "true" or "false"
              console.log(
                `    - Parent is IF block. activeBranch: ${activeBranch}, edgeHandle: ${edgeHandle}`,
              );
              if (
                activeBranch === "truePath" &&
                (edgeHandle === "false" || edgeHandle === "falsePath")
              ) {
                shouldSkip = true;
                console.log(
                  `    - Mismatch: truePath vs ${edgeHandle}. Triggering skip.`,
                );
              } else if (
                activeBranch === "falsePath" &&
                (edgeHandle === "true" || edgeHandle === "truePath")
              ) {
                shouldSkip = true;
                console.log(
                  `    - Mismatch: falsePath vs ${edgeHandle}. Triggering skip.`,
                );
              } else if (!activeBranch) {
                shouldSkip = true;
                console.log(
                  `    - No active branch found in IF block output. Triggering skip.`,
                );
              }
            } else if (parentType === "iem.conductor.forEach") {
              const activeBranch = result.payload?.branch; // e.g. "loopPath" or "exitPath"
              const edgeHandle = edge.sourceHandle || edge.data?.fromHandleId; // e.g. "loop" or "exit"
              console.log(
                `    - Parent is FOR EACH block. activeBranch: ${activeBranch}, edgeHandle: ${edgeHandle}`,
              );
              if (
                activeBranch === "loopPath" &&
                (edgeHandle === "exit" || edgeHandle === "exitPath")
              ) {
                shouldSkip = true;
                console.log(
                  `    - Mismatch: loopPath vs ${edgeHandle}. Triggering skip.`,
                );
              } else if (
                activeBranch === "exitPath" &&
                (edgeHandle === "loop" || edgeHandle === "loopPath")
              ) {
                shouldSkip = true;
                console.log(
                  `    - Mismatch: exitPath vs ${edgeHandle}. Triggering skip.`,
                );
              } else if (!activeBranch) {
                shouldSkip = true;
                console.log(
                  `    - No active branch found in FOR EACH block output. Triggering skip.`,
                );
              }
            }

            envelopes.push(result);
          } else {
            console.log(`    - No result found for parent ${sourceId}`);
          }
        }

        // If skip is determined, return a skipped envelope immediately
        if (shouldSkip) {
          console.log(`[WORKFLOW EXEC] Step ${node.id} is SKIPPED.`);
          // @ts-ignore
          const skippedEnvelope = createEnvelope({
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
            payload: { status: "skipped" },
          });

          // Publish to the Message Fabric so listeners are aware
          await fabric.publish(skippedEnvelope);
          return skippedEnvelope;
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

  compiledEdges.forEach((e: any) => {
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
  const triggers = Array.from(inDegree.entries()).filter(([id, degree]) => {
    if (degree !== 0 || !steps.has(id)) return false;
    const node = graph.nodes.find((n) => n.id === id);
    const type = node ? node.type || node.blockId : "";
    return (
      type !== "iem.conductor.subGraphHead" && type !== "conductor.subGraphHead"
    );
  });

  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0 && steps.has(id)) {
      const node = graph.nodes.find((n) => n.id === id);
      const type = node ? node.type || node.blockId : "";
      if (
        (type === "iem.conductor.subGraphHead" ||
          type === "conductor.subGraphHead") &&
        triggers.length > 0
      ) {
        continue;
      }
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
