import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { messageBus, BalnceFabricLane } from "@iem/core";
import jwt from "jsonwebtoken";

const a2aRouter = new Hono();

import { authMiddleware } from "../middleware/auth.js";

a2aRouter.use("*", authMiddleware);

// SSE Endpoint for Fabric UI Projection
a2aRouter.get("/stream", async (c) => {
  const lanes = (c.req.query("lanes")?.split(",") as BalnceFabricLane[]) || [
    "agent_stream",
    "workflow_trace",
    "ui_projection",
  ];
  const runId = c.req.query("runId");

  return streamSSE(c, async (stream) => {
    console.log(
      `[FABRIC-PROJECTION] UI Connected for lanes: ${lanes.join(", ")}`,
    );

    const unsubscribe = await (messageBus as any).subscribe(
      { lanes, runId },
      async (envelope: any) => {
        // Security Boundary: Check visibility
        if (envelope.policy?.visibility === "private") {
          return;
        }

        await stream.writeSSE({
          data: JSON.stringify(envelope),
          event: "envelope",
          id: envelope.id,
        });
      },
    );

    stream.onAbort(() => {
      console.log("[FABRIC-PROJECTION] UI Disconnected");
      if (typeof unsubscribe === "function") unsubscribe();
      else if (unsubscribe && (unsubscribe as any).unsubscribe)
        (unsubscribe as any).unsubscribe();
    });

    // Keep-alive
    while (true) {
      await stream.sleep(30000);
      await stream.writeSSE({ data: "ping", event: "ping" });
    }
  });
});

// A2A History Endpoint
a2aRouter.get("/history", async (c) => {
  const traceId = c.req.query("traceId");
  const runId = c.req.query("runId");

  // In our promoted fabric, the router might have a replay method or we query the log directly
  // For now, keep it simple and query the messageBus if it supports replay
  if ((messageBus as any).replay) {
    const history = await (messageBus as any).replay({ traceId, runId });
    return c.json(history);
  }

  return c.json([]);
});

export { a2aRouter };
