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
  const body = await c.req.json();

  const { sessionId } = body;

  if (!sessionId) {
    return c.json({ error: "Session ID is required" }, 400);
  }

  // Handle various message formats from different SDKs
  let messagesToProcess: any[] = [];

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messagesToProcess = body.messages;
  } else if (body.messages && typeof body.messages === "object") {
    messagesToProcess = [body.messages];
  } else if (body.text || body.content || body.prompt) {
    messagesToProcess = [
      {
        role: body.role || "user",
        content: body.text || body.content || body.prompt,
      },
    ];
  }

  // Final sanitization
  messagesToProcess = messagesToProcess
    .map((m) => {
      if (typeof m === "string") return { role: "user", content: m };
      const content =
        m.content ||
        m.text ||
        m.body ||
        (typeof m === "object" ? m.content || m.text : String(m));
      return {
        role: m.role || m.type || "user",
        content: String(content || ""),
      };
    })
    .filter(
      (m) => m.content && m.content !== "undefined" && m.content !== "null",
    );

  if (messagesToProcess.length === 0) {
    return c.json({ error: "Messages array is required" }, 400);
  }

  // Verify session ownership
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, sessionId));

  if (!workspace || workspace.ownerId !== user.sub) {
    return c.json({ error: "Session not found or unauthorized" }, 403);
  }

  try {
    const { handleChatStream } = await import("@mastra/ai-sdk");

    // handleChatStream is the canonical way to bridge Mastra to AI SDK 6.0
    const stream = await handleChatStream({
      mastra,
      agentId: "orchestrator",
      version: "v6",
      params: {
        messages: messagesToProcess,
        memory: { thread: sessionId },
      } as any,
    });

    const { createUIMessageStreamResponse } = await import("ai");
    return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    console.error("[MASTRA EXECUTION ERROR]:", error.message);
    return c.json(
      {
        error: "Agent orchestration failed",
        message: error.message,
      },
      500,
    );
  }
});

export { chatRouter };
