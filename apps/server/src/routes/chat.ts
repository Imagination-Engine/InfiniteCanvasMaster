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

  let messagesToProcess: any[] = [];

  if (Array.isArray(body.messages)) {
    messagesToProcess = body.messages;
  } else if (body.message && typeof body.message === "object") {
    messagesToProcess = [body.message];
  } else if (body.content || body.text || body.prompt) {
    messagesToProcess = [
      {
        role: body.role || "user",
        content: body.content || body.text || body.prompt,
      },
    ];
  }

  const sanitizedMessages = messagesToProcess
    .map((m) => {
      if (typeof m === "string") return { role: "user", content: m };
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
    return c.json({ error: "Messages array is required" }, 400);
  }

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

    // Prepend a system directive so the AI explicitly knows the owner ID for tool calls.
    const finalMessages = [
      {
        role: "system",
        content: `CRITICAL SYSTEM DIRECTIVE: The user's ID is "${user.sub}". You MUST pass this exact string into the 'owner_id' parameter when calling the 'generate_canvas_blueprint' tool. Failure to do so will result in a system crash.`,
      },
      ...sanitizedMessages,
    ];

    const result = await agent.stream(finalMessages, {
      threadId: sessionId,
      resourceId: user.sub,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          }

          const rawToolCalls = await result.toolCalls;
          const rawToolResults = await result.toolResults;
          const steps = await (result as any).steps;

          if (rawToolCalls && rawToolCalls.length > 0) {
            for (const wrapper of rawToolCalls) {
              const toolCall = wrapper.payload || wrapper;

              const resultWrapper = rawToolResults?.find((r: any) => {
                const resPayload = r.payload || r;
                return resPayload.toolCallId === toolCall.toolCallId;
              });

              const toolResult = resultWrapper
                ? resultWrapper.payload || resultWrapper
                : undefined;

              const uiToolPayload = {
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args,
                result: toolResult ? toolResult.result : undefined,
              };

              controller.enqueue(
                encoder.encode(`9:${JSON.stringify(uiToolPayload)}\n`),
              );
            }
          } else if (steps && steps.length > 0) {
            for (const step of steps) {
              if (step.toolCalls && step.toolCalls.length > 0) {
                for (const wrapper of step.toolCalls) {
                  const toolCall = wrapper.payload || wrapper;
                  const resultWrapper = step.toolResults?.find((r: any) => {
                    const resPayload = r.payload || r;
                    return resPayload.toolCallId === toolCall.toolCallId;
                  });

                  const toolResult = resultWrapper
                    ? resultWrapper.payload || resultWrapper
                    : undefined;

                  const uiToolPayload = {
                    toolCallId: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    args: toolCall.args,
                    result: toolResult ? toolResult.result : undefined,
                  };
                  controller.enqueue(
                    encoder.encode(`9:${JSON.stringify(uiToolPayload)}\n`),
                  );
                }
              }
            }
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
