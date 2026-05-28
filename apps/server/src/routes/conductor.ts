import { Hono } from "hono";
import { db } from "@iem/db";
import {
  conductorGraphs,
  conductorNodes,
  conductorRuns,
} from "@iem/db/src/schema/conductor.js";
import { eq, and } from "drizzle-orm";
import { tickConductorNode } from "@iem/surface-conductor/src/runtime/engine.js";
import { ConductorEnvelope } from "@iem/surface-conductor/src/types/runtime.js";

const conductorRouter = new Hono();

conductorRouter.post("/webhook/:graphId/:nodeId", async (c) => {
  const graphId = c.req.param("graphId");
  const nodeId = c.req.param("nodeId");
  const payload = await c.req.json();

  // 1. Validate Graph and Node exist
  const [graph] = await db
    .select()
    .from(conductorGraphs)
    .where(eq(conductorGraphs.id as any, graphId) as any);
  if (!graph) return c.json({ error: "Graph not found" }, 404);

  const [node] = await db
    .select()
    .from(conductorNodes)
    .where(
      and(
        eq(conductorNodes.id as any, nodeId),
        eq(conductorNodes.graphId as any, graphId),
        eq(conductorNodes.kind as any, "webhook"),
      ) as any,
    );
  if (!node) return c.json({ error: "Webhook node not found" }, 404);

  // 2. Initialize a new Run
  const initialRunId = crypto.randomUUID();
  const initialState = {
    runId: initialRunId,
    graphId: graph.id,
    items: [],
    memory: {},
    variables: {},
    messages: [],
    artifacts: [],
    errors: [],
  };

  await db.insert(conductorRuns).values({
    id: initialRunId,
    graphId: graph.id,
    status: "running",
    input: payload,
    state: initialState,
    startedAt: new Date(),
  });

  // 3. Create the initial envelope representing the webhook payload
  const initialEnvelope: ConductorEnvelope = {
    id: crypto.randomUUID(),
    runId: initialRunId,
    graphId: graph.id,
    sourceNodeId: node.id,
    type: "data",
    payload: payload,
    trace: {
      previousEnvelopeIds: [],
      attempt: 1,
      spanId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };

  // 4. Fire and forget the tick execution (background process)
  // This pushes the state machine forward without blocking the HTTP response
  c.executionCtx.waitUntil(
    tickConductorNode(initialRunId, node.id, [initialEnvelope]),
  );

  return c.json({
    success: true,
    runId: initialRunId,
    message: "Conductor execution started via webhook.",
  });
});

export { conductorRouter };
