import { db } from "@iem/db";
import {
  conductorRuns,
  conductorEvents,
  conductorNodeResults,
  conductorNodes,
} from "@iem/db/src/schema/conductor.js";
import { eq } from "drizzle-orm";
import {
  ConductorEnvelope,
  ConductorRuntimeState,
  ConductorGraph,
  ConductorNode,
} from "../types/runtime.js";
import { ConductorNodeExecutor } from "./executor.js";
import { resolveMappings } from "./mapping.js";
import { ApiNodeExecutor } from "../nodes/ApiNode.js";
import { AgentNodeExecutor } from "../nodes/AgentNode.js";
import { GenericBlockExecutor } from "../nodes/GenericBlockExecutor.js";

// Mock registry mapping node kinds to their executor implementations
const executors = new Map<string, ConductorNodeExecutor>();

export function registerExecutor(
  kind: string,
  executor: ConductorNodeExecutor,
) {
  executors.set(kind, executor);
}

// Register dedicated executors
registerExecutor("api", new ApiNodeExecutor());
registerExecutor("agent", new AgentNodeExecutor());

// Register GenericBlockExecutor for all other node kinds
const genericExecutor = new GenericBlockExecutor();
const genericKinds = [
  "trigger", "webhook", "condition", "transform", "merge",
  "loop", "human_checkpoint", "artifact", "output", "prompt", "tool",
];
for (const kind of genericKinds) {
  registerExecutor(kind, genericExecutor);
}

/**
 * Ticks a single execution step for a specific node in a conductor run.
 * Employs the Postgres-backed state machine design to ensure durable execution.
 */
export async function tickConductorNode(
  runId: string,
  nodeId: string,
  incomingEnvelopes: ConductorEnvelope[],
): Promise<void> {
  // 1. Fetch Run State and Node Config
  const [run] = await db
    .select()
    .from(conductorRuns)
    .where(eq(conductorRuns.id as any, runId) as any);
  if (!run || run.status !== "running") return;

  const [dbNode] = await db
    .select()
    .from(conductorNodes)
    .where(eq(conductorNodes.id as any, nodeId) as any);
  if (!dbNode) return;

  const node: ConductorNode = {
    id: dbNode.id,
    canvasBlockId: dbNode.canvasBlockId,
    kind: dbNode.kind as any,
    label: dbNode.label,
    inputPorts: dbNode.inputPorts as any,
    outputPorts: dbNode.outputPorts as any,
    config: dbNode.config as Record<string, unknown>,
    runtime: dbNode.runtime as any,
  };

  const state = run.state as unknown as ConductorRuntimeState;

  // 2. Fetch Executor
  const executor = executors.get(node.kind);
  if (!executor) {
    throw new Error(`No executor registered for node kind: ${node.kind}`);
  }

  // 3. Mark Node Result as started (Phase 4 Persistence)
  const [resultRecord] = await db
    .insert(conductorNodeResults)
    .values({
      runId,
      nodeId,
      status: "running",
      inputEnvelopes: incomingEnvelopes,
    })
    .returning();

  try {
    // 4. Execute the Node
    const result = await executor.execute({
      node,
      state,
      incoming: incomingEnvelopes,
    });

    // 5. Update state if patch provided
    const nextState = { ...state, ...result.statePatch };

    // 6. Save outputs and complete the node result (Phase 4 Persistence)
    await db
      .update(conductorNodeResults)
      .set({
        status: "completed",
        outputEnvelopes: result.outputs,
        artifacts: result.artifacts || [],
        logs: result.logs || [],
        completedAt: new Date(),
      })
      .where(eq(conductorNodeResults.id as any, resultRecord.id) as any);

    // Save individual events
    for (const envelope of result.outputs) {
      await db.insert(conductorEvents).values({
        runId,
        nodeId,
        eventType: "envelope_created",
        envelope: envelope,
      });
    }

    // 7. Update run state
    await db
      .update(conductorRuns)
      .set({ state: nextState })
      .where(eq(conductorRuns.id as any, runId) as any);

    // 8. Route output envelopes to downstream nodes via edges
    try {
      const { conductorEdges } = await import("@iem/db/src/schema/conductor.js");
      const edges = await db
        .select()
        .from(conductorEdges)
        .where(eq(conductorEdges.sourceNodeId as any, nodeId) as any);

      for (const edge of edges) {
        // Apply transform mappings if configured, otherwise pass outputs directly
        let mappedEnvelopes = result.outputs;
        if (edge.transform && (edge.transform as any).mappings) {
          const mapped = resolveMappings(
            (edge.transform as any).mappings,
            nextState,
            result.outputs,
          );
          mappedEnvelopes = [
            {
              ...result.outputs[0],
              id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              targetNodeId: edge.targetNodeId,
              payload: mapped,
            },
          ];
        }

        // Fire-and-forget: tick the downstream node
        tickConductorNode(runId, edge.targetNodeId, mappedEnvelopes).catch(
          (err) => console.error(`[ENGINE] Edge routing error → ${edge.targetNodeId}:`, err),
        );
      }
    } catch (edgeErr) {
      // Edge routing is best-effort; log but don't fail the current node
      console.error("[ENGINE] Edge routing lookup failed:", edgeErr);
    }
  } catch (error) {
    // Handle Error Persistence
    await db
      .update(conductorNodeResults)
      .set({
        status: "failed",
        error: { message: (error as Error).message },
        completedAt: new Date(),
      })
      .where(eq(conductorNodeResults.id as any, resultRecord.id) as any);

    await db
      .update(conductorRuns)
      .set({ status: "failed", failedAt: new Date() })
      .where(eq(conductorRuns.id as any, runId) as any);
  }
}
