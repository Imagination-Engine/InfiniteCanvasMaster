import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { messageBus, BALNCE_A2A_PROTOCOL } from "@iem/core";
import jwt from "jsonwebtoken";

const a2aRouter = new Hono();

const getSecrets = (c: any) => {
  return {
    JWT_SECRET:
      c.env?.JWT_SECRET ||
      process.env.JWT_SECRET ||
      "super-secret-fallback-key",
  };
};

// SSE Endpoint for A2A Fabric Observation
a2aRouter.get("/stream", async (c) => {
  const { JWT_SECRET } = getSecrets(c);
  const token = c.req.query("token");

  if (!token) {
    return c.json({ error: "Missing token" }, 401);
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const topicFilter = c.req.query("topic") || "#"; // # is wildcard for some systems, our local bus is EventEmitter

  return streamSSE(c, async (stream) => {
    console.log(`[A2A-BRIDGE] UI Connected to topic: ${topicFilter}`);

    // Subscribe to everything on the local fabric
    // Note: LocalEventEmitterTransport uses literal topics, so for # we'd need a different approach
    // For now, let's assume specific topics or a 'global' emitter we can tap into.
    // In our current LocalEventEmitterTransport, it's just an EventEmitter.

    const { unsubscribe } = messageBus.subscribe(
      topicFilter,
      async (envelope) => {
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
      console.log("[A2A-BRIDGE] UI Disconnected");
      unsubscribe();
    });

    // Keep-alive
    while (true) {
      await stream.sleep(30000);
      await stream.writeSSE({ data: "ping", event: "ping" });
    }
  });
});

export { a2aRouter };
