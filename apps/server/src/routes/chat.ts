import { Hono } from "hono";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { eq, asc } from "drizzle-orm";
import { messages, sessions } from "../schema.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

const chatRouter = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fallback-key";

// Initialize Gemini provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
});

// Auth Middleware
chatRouter.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (err) {
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
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (!session || session.ownerId !== user.sub) {
    return c.json({ error: "Session not found or unauthorized" }, 403);
  }

  // Get historical messages from DB (including the seeded story)
  const historicalMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.createdAt));

  // The latest message is the one the user just sent, if any.
  // Wait, the client sends the full array. Let's append the last incoming message to the DB.
  const latestMessage = incomingMessages[incomingMessages.length - 1];

  if (latestMessage.role === "user") {
    // Save user's new message
    await db.insert(messages).values({
      sessionId,
      role: "user",
      content: latestMessage.content,
    });
  }

  // Construct context payload.
  // We'll merge historical with whatever the client sent, but prioritize historical.
  const coreMessages = historicalMessages.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  // If the very first message is the story, the AI should know to deconstruct it.
  const systemPrompt = `You are the Imagination Engine, an expert AI agent orchestrator and block canvas builder. 
Your goal is to help the user deconstruct their goals into actionable canvas blocks. 
Respond concisely. Suggest specific block types to add to the canvas.`;

  const result = await streamText({
    model: google("gemini-2.5-pro"),
    system: systemPrompt,
    messages: coreMessages,
    tools: {
      create_canvas_block: {
        description:
          "Suggest a new block to be added to the canvas based on the goal deconstruction.",
        parameters: z.object({
          type: z.enum(["prose", "chapter", "agent"]),
          title: z.string(),
          description: z.string(),
        }),
        execute: async ({ type, title, description }) => {
          return { success: true, type, title, description };
        },
      },
    },
    onFinish: async ({ text, toolCalls }) => {
      // Save AI response to DB
      await db.insert(messages).values({
        sessionId,
        role: "assistant",
        content: text || "",
        toolCalls: toolCalls?.length > 0 ? toolCalls : null,
      });
    },
  });

  return result.toTextStreamResponse();
});

export { chatRouter };
