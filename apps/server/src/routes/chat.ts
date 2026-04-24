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

  console.log(
    "[ENGINE-V2-STREAM] Incoming chat payload keys:",
    Object.keys(body),
  );

  // Handle various message formats from different SDKs
  let messagesToProcess: any[] = [];

  // 1. Standard AI SDK 'messages' array
  if (Array.isArray(body.messages)) {
    messagesToProcess = body.messages;
  }
  // 2. Single 'message' object
  else if (body.message && typeof body.message === "object") {
    messagesToProcess = [body.message];
  }
  // 3. Flat 'content' or 'text' in the body
  else if (body.content || body.text || body.prompt) {
    messagesToProcess = [
      {
        role: body.role || "user",
        content: body.content || body.text || body.prompt,
      },
    ];
  }

  // Final sanitization to ensure Mastra gets the right shape
  const sanitizedMessages = messagesToProcess
    .map((m) => {
      if (typeof m === "string") return { role: "user", content: m };

      // Extract content from any possible field
      const contentValue = m.content || m.text || m.body || m.prompt;

      return {
        role: m.role || "user",
        content: String(contentValue || ""),
      };
    })
    .filter(
      (m) => m.content && m.content !== "undefined" && m.content !== "null",
    );

  if (sanitizedMessages.length === 0) {
    console.error(
      "[ENGINE] Extraction failed. Body received:",
      JSON.stringify(body),
    );
    return c.json(
      {
        error: "Messages array is required",
        receivedKeys: Object.keys(body),
      },
      400,
    );
  }

  console.log(
    `[ENGINE] Processing ${sanitizedMessages.length} messages for session ${sessionId}`,
  );

  // Verify session ownership if it's not a transient draft
  if (sessionId && !sessionId.startsWith("draft-")) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, sessionId));

    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Session not found or unauthorized" }, 403);
    }
  }

  try {
    const agent = mastra.getAgent("orchestrator");

    // Manually trigger the stream from the agent
    const result = await agent.stream(sanitizedMessages, {
      threadId: sessionId,
      resourceId: user.sub,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.textStream) {
            // Write directly in AI SDK Data Stream Format: 0:"chunk"\n
            const formattedChunk = `0:${JSON.stringify(chunk)}\n`;
            controller.enqueue(encoder.encode(formattedChunk));
          }
        } catch (err: any) {
          console.error("[STREAM ITERATION ERROR]:", err);
          const errorChunk = `3:{"message":${JSON.stringify(err.message)}}\n`;
          controller.enqueue(encoder.encode(errorChunk));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-vercel-ai-data-stream": "v1",
      },
    });
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
