import { Hono } from "hono";
import { stream } from "hono/streaming";

export const healthRouter = new Hono();

healthRouter.get("/", (c) => {
  return c.json({ status: "ok" });
});

healthRouter.get("/stream-test", (c) => {
  console.log("[DIAGNOSTIC] Stream test triggered");
  c.header("Content-Type", "text/plain; charset=utf-8");
  c.header("X-Content-Type-Options", "nosniff");

  return stream(c, async (stream) => {
    const encoder = new TextEncoder();
    for (let i = 1; i <= 5; i++) {
      const chunk = `Diagnostic Chunk #${i} at ${new Date().toLocaleTimeString()}\n`;
      console.log(`[DIAGNOSTIC] Sending: ${chunk.trim()}`);
      await stream.write(encoder.encode(chunk));
      await stream.sleep(500);
    }
    console.log("[DIAGNOSTIC] Stream complete");
  });
});
