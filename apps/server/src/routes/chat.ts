import { Hono } from "hono";
import { mastra } from "@iem/agents";
import { eq } from "drizzle-orm";
import { workspaces } from "@iem/db";
import jwt from "jsonwebtoken";

const chatRouter = new Hono();

const getSecrets = (c: any) => {
  return {
    JWT_SECRET:
      c.env?.JWT_SECRET ||
      process.env.JWT_SECRET ||
      "super-secret-fallback-key",
  };
};

// Auth Middleware
chatRouter.use("*", async (c, next) => {
  const { JWT_SECRET } = getSecrets(c);
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[CHAT AUTH] Missing or invalid Authorization header");
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (err) {
    console.error("[CHAT AUTH] JWT Verify failed:", err);
    return c.json({ error: "Invalid token" }, 401);
  }
});

chatRouter.post("/", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const { messages: incomingMessages, sessionId } = await c.req.json();

  if (!sessionId) {
    return c.json({ error: "Session ID is required" }, 400);
  }

  // Verify session belongs to user
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, sessionId));
    
  if (!workspace || workspace.ownerId !== user.sub) {
    return c.json({ error: "Session not found or unauthorized" }, 403);
  }

  const orchestrator = mastra.getAgent('orchestrator');

  // Mastra handles persistence automatically via the PostgresStore we configured
  const result = await orchestrator.stream(incomingMessages, {
    threadId: sessionId,
  });

  return result.toDataStreamResponse();
});

export { chatRouter };
