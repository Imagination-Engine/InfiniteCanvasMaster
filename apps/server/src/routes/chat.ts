import { Hono } from "hono";
import { mastra } from "@iem/agents";
import { eq } from "drizzle-orm";
import { workspaces } from "@iem/db";
import jwt from "jsonwebtoken";

const chatRouter = new Hono();

import { authMiddleware } from "../middleware/auth.js";

chatRouter.use("*", authMiddleware);

chatRouter.post("/", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const body = await c.req.json();
  // Debug: log incoming payload for block context
  if (body.blockContext) {
    console.log("[CHAT ROUTE] Received blockContext:", body.blockContext);
  }

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

  // Only enforce workspace existence if this is not marked as a draft/block session
  if (
    sessionId &&
    !sessionId.startsWith("draft-") &&
    !sessionId.startsWith("block-chat-") &&
    !body.isDraft
  ) {
    const [workspace] = await db
      .select()
      .from(workspaces as any)
      .where(eq((workspaces as any).id, sessionId));

    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Session not found or unauthorized" }, 403);
    }
  }

  try {
    // @ts-ignore
    const { createOrchestrator, createBlockAssistant, mastra } =
      await import("@iem/agents");

    let agent;
    let systemInstruction = "";

    if (body.blockContext) {
      // Debug: log block context details before constructing system instruction
      console.log("[CHAT ROUTE] Preparing system instruction for block:", {
        instanceId: body.blockContext.instanceId,
        type: body.blockContext.type,
        currentData: body.blockContext.currentData,
      });
      agent = await createBlockAssistant(mastra.storage);

      const { instanceId, type, currentData } = body.blockContext;
      let blockDef: any = null;
      try {
        // @ts-ignore
        const { blockRegistry } = await import("@iem/core");
        blockDef = blockRegistry.get(type);
      } catch (e) {
        console.warn(
          `[CHAT ROUTE] Could not get block registry definition for ${type}`,
        );
      }

      const blockName = blockDef?.name || type;
      const blockDesc =
        blockDef?.description || "A functional node on the canvas.";
      const blockCategory = blockDef?.category || "general";

      let schemaStr = "";
      if (blockDef?.input) {
        try {
          if (blockDef.input.shape) {
            const shapeKeys = Object.keys(blockDef.input.shape);
            schemaStr = shapeKeys
              .map((key: string) => {
                const field = blockDef.input.shape[key];
                const desc = field.description || field._def?.description || "";
                return `- **${key}**: ${desc || "Any value"}`;
              })
              .join("\n");
          }
        } catch (e) {
          schemaStr = "Zod validation schema";
        }
      }

      systemInstruction = `You are a specialized Block Configuration Assistant within the Imagination Engine.
Your ROLE is to help the user configure the parameters and settings of a SINGLE specific block on the canvas.

HARD LIMITS:
1. You are LOCKED into the block instance provided in the context.
2. You MUST NOT suggest or attempt to modify other nodes, structural changes, or the overall canvas layout.
3. Your ONLY way to apply changes is through the 'configure_block' tool.
4. You do NOT have access to 'generate_canvas_blueprint'.

OPERATIONAL GUIDELINES:
- Be precise. If a user says "change the color to blue", identify the correct parameter in the block's schema and call 'configure_block'.
- Be conversational but focused. Do not wander into architectural discussions.
- If the user asks for something outside your scope (like "add a new node"), explain that you are a specialized assistant for this block and suggest they ask the main Orchestrator for canvas-level changes.

CURRENT BLOCK CONTEXT:
- **Block ID/Instance ID**: \`${instanceId}\`
- **Block Type**: \`${type}\`
- **Block Name**: ${blockName}
- **Description**: ${blockDesc}
- **Category**: ${blockCategory}

### ACCEPTED PARAMETERS (SCHEMA):
${schemaStr || "No specific schema registered."}

### CURRENT CONFIGURATION:
\`\`\`json
${JSON.stringify(currentData || {}, null, 2)}
\`\`\`
`;
    } else {
      agent = await createOrchestrator(mastra.storage);

      let canvasSystemPrompt = "";
      if (body.canvasContext) {
        canvasSystemPrompt = `\n\nCURRENT CANVAS STATE:\nNodes: ${JSON.stringify(body.canvasContext.nodes)}\nEdges: ${JSON.stringify(body.canvasContext.edges)}\nBe aware of these existing nodes and connections when suggesting changes, discussing the workspace, or generating blueprints. You are contiguous with the canvas experience.`;
      }

      systemInstruction = `You are the Imagination Engine Orchestrator. 
CRITICAL MISSION: When a user describes a goal, idea, or request, you MUST deconstruct it into a functional architecture and call the 'generate_canvas_blueprint' tool to place blocks on the canvas. 

The user's ID is "${user.sub}". You MUST pass this exact string into the 'owner_id' parameter of every tool call. Also, pass the session thread ID "${sessionId}" to the 'session_id' parameter if generating a blueprint to link history.

<<<<<<< HEAD
Identify the best blocks from the registry (scribe, playable, reel, forge, atlas, workflow) to represent the solution. Wire them together using edges to form a logical flow.

REEL / VIDEO RULES (use EXACT block type IDs in blueprint nodes):
- Reference stills: "iem.reel.textToImage" (one node per key frame; put the full Gemini image prompt in node description and recommended_params.prompt).
- Video forge: "iem.studio.video" — REQUIRED when the user wants a reel, video, animation, or to forge footage from reference images.
- Pattern: connect each iem.reel.textToImage → iem.studio.video (edges source→target). Put the motion/Veo prompt on the video studio node description.
- Anime / screencap requests: preserve style instructions in EACH textToImage description (e.g. ufotable style, Fate/stay night UBW, "Are you my Master" scene) — do not shorten them.
- If the user only asked for images with no mention of video/reel/animation, textToImage nodes alone are fine; if they want a final video, always include iem.studio.video.${canvasSystemPrompt}`;
    }

    const finalMessages = [
      {
        role: "system",
        content: systemInstruction,
      },
      ...sanitizedMessages,
    ];

    const result = await agent.stream(finalMessages, {
      threadId: sessionId, // This tells Mastra to load history and save this turn!
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

chatRouter.post("/block", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const body = await c.req.json();

  const { blockId, projectId, messages } = body;

  if (!blockId || !projectId) {
    return c.json({ error: "blockId and projectId are required" }, 400);
  }

  // 1. Verify ownership and existence
  const [workspace] = await db
    .select()
    .from(workspaces as any)
    .where(eq((workspaces as any).id, projectId));

  if (!workspace || workspace.ownerId !== user.sub) {
    return c.json({ error: "Project not found or unauthorized" }, 403);
  }

  try {
    const { AgentFactory, mastra } = await import("@iem/agents");
    const { blockRegistry } = await import("@iem/core");
    const { nodes } = await import("@iem/db");

    // 2. Resolve Block Definition from DB
    const [node] = await db
      .select()
      .from(nodes as any)
      .where(eq((nodes as any).id, blockId));

    if (!node) {
      return c.json({ error: "Block not found on canvas" }, 404);
    }

    // 3. Resolve Block Logic/Persona from Registry
    const definition = (blockRegistry as any).get(node.type);
    if (!definition) {
      return c.json(
        { error: `Block definition not found for type: ${node.type}` },
        404,
      );
    }

    // 4. Create Agent via Factory
    const factory = new AgentFactory({ storage: mastra.storage });
    const agent = await factory.createAgentForBlock(definition);

    // 5. Scoped Thread ID (Project + Block isolation)
    const threadId = `${projectId}:${blockId}`;

    // 6. Stream Chat using Mastra Agent
    console.log(
      `[BLOCK-CHAT] Initiating stream for block: ${node.id} (${node.type}) on thread: ${threadId}`,
    );

    const result = await agent.stream(messages, {
      threadId,
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
          console.error("[BLOCK-STREAM-ERROR]:", err);
          controller.enqueue(
            encoder.encode(`3:{"message":${JSON.stringify(err.message)}}\n`),
          );
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
    console.error("[BLOCK-CHAT-ERROR]:", error);
    return c.json(
      { error: "Block agent chat failed", message: error.message },
      500,
    );
  }
});

export { chatRouter };
