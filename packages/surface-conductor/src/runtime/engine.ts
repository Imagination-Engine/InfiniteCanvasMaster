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

// Mock registry mapping node kinds to their executor implementations
const executors = new Map<string, ConductorNodeExecutor>();

export function registerExecutor(
  kind: string,
  executor: ConductorNodeExecutor,
) {
  executors.set(kind, executor);
}

// Register default nodes
registerExecutor("api", new ApiNodeExecutor());
registerExecutor("agent", new AgentNodeExecutor());

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
    .where(eq(conductorRuns.id, runId));
  if (!run || run.status !== "running") return;

  const [dbNode] = await db
    .select()
    .from(conductorNodes)
    .where(eq(conductorNodes.id, nodeId));
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
      .where(eq(conductorNodeResults.id, resultRecord.id));

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
      .where(eq(conductorRuns.id, runId));

    // 8. Queue next nodes (To be implemented: Route via edges to target nodes)
    // const edges = await db.select().from(conductorEdges).where(eq(conductorEdges.sourceNodeId, nodeId));
    // for (const edge of edges) {
    //   if edge condition passes:
    //     mappedEnvelopes = resolveMappings(edge.transform, ...)
    //     trigger next node (e.g. queue next tick)
    // }
  } catch (error) {
    // Handle Error Persistence
    await db
      .update(conductorNodeResults)
      .set({
        status: "failed",
        error: { message: (error as Error).message },
        completedAt: new Date(),
      })
      .where(eq(conductorNodeResults.id, resultRecord.id));

    await db
      .update(conductorRuns)
      .set({ status: "failed", failedAt: new Date() })
      .where(eq(conductorRuns.id, runId));
  }
}
