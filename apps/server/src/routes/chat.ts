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

  // Only enforce workspace existence if this is not marked as a draft session
  if (sessionId && !sessionId.startsWith("draft-") && !body.isDraft) {
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
    const { createOrchestrator, mastra, storage } = await import("@iem/agents");
    const agent = await createOrchestrator(
      mastra.storage || mastra.config?.storage || storage,
    );

    let canvasSystemPrompt = "";
    if (body.canvasContext) {
      canvasSystemPrompt = `\n\nCURRENT CANVAS STATE:\nNodes: ${JSON.stringify(body.canvasContext.nodes)}\nEdges: ${JSON.stringify(body.canvasContext.edges)}\nBe aware of these existing nodes and connections when suggesting changes, discussing the workspace, or generating blueprints. You are contiguous with the canvas experience.`;
    }

    // Pass the ENTIRE message history from the UI (which already contains the context),
    // and prepend the dynamic system message so the model has the rules.
    const finalMessages = [
      {
        role: "system",
        content: `You are the AI Architect. Your mission is to deconstruct user goals into functional technical architectures on a visual canvas.

DECONSTRUCTION PROTOCOL:
1. INTENT GATEKEEPER:
- You ONLY support building "Apps" (Web, Desktop, CLI), "Games" (simple browser-playable games), "Videos" (Movies, Reels), or "Workflows" (automation DAGs like Zapier, Make, or n8n).
- If the user asks for anything else (recipes, general advice, etc.), you MUST politely explain your specialization and refuse.

2. PHASE 1: RESEARCH & PLAN (turns 1-3)
- If this is a new request, do NOT call tools yet. Engage conversationally to define the App Type (WEB, DESKTOP, CLI), Game Type, Video Style, or Workflow Trigger/Actions.
- Once the plan is solid, say "Let's generate the workflow!" and call 'generate_canvas_blueprint'.

3. PHASE 2: SURGICAL MUTATION (Ongoing)
- After the canvas exists, you MUST respond to every request by surgically mutating the state.
- Use 'add_block' to drop in new ideas.
- Use 'connect_blocks' to refine logic.
- Use 'update_block' to tweak existing nodes.

APP BUILDING PROTOCOL:
- For software (Web/Desktop/CLI), your blueprint MUST follow this DAG:
  Architecture Node (iem.scribe.prose) -> Programmer Node(s) (iem.core.programmer) -> QA Review Node (iem.scribe.editor) -> Finalize/Preview Node (iem.app.web).

GAME BUILDING PROTOCOL:
- For games, generate a simple browser-playable web game DAG:
  Game Concept (iem.forge.architect) -> Core Rules (iem.playable.rule) -> Entities & Scene (iem.playable.sprite) -> Browser Controls (iem.playable.input) -> Playable Web Game Builder (iem.forge.builder) -> Playtest/QA (iem.forge.tester).
- The builder node description MUST require a complete playable browser game with index.html, style.css, game.js, README.md, no server dependency, keyboard/mouse/touch controls as appropriate, and a JSON "files" array.
- Tell the builder that the generated game must be playable directly in the browser and downloadable as a ZIP.

WORKFLOW AUTOMATION PROTOCOL:
- For workflows, generate an executable automation DAG, not a static diagram.
- Start with exactly one trigger node: use iem.conductor.schedule for timer/every-N-minutes/cron workflows, or iem.conductor.webhook for received-message/webhook/event workflows.
- Add 2-5 connected action/logic nodes that consume prior output and pass output downstream.
- Prefer these executable node types: iem.conductor.webFetch, iem.conductor.agent, iem.conductor.if, iem.conductor.router, iem.conductor.saas, iem.conductor.slackPost, iem.conductor.notionCreate, iem.conductor.state, iem.conductor.delay.
- Put editable config in recommended_params (cron, path, url, provider, action, params, instructions, channel, message, databaseId, properties).
- The resulting graph should be easy for the user to extend manually by dragging more nodes from the node library and connecting them into the chain.

MOVIE BUILDING PROTOCOL:
- DECONSTRUCT the user's story into 3-4 specific VISUAL SCENES.
- Create one 'iem.reel.textToImage' node per scene. 
- The node description MUST be the detailed Gemini prompt for that specific visual beat.
- CONNECT all 'iem.reel.textToImage' nodes -> 'iem.studio.video' (Video Forge).
- DO NOT use generic "Design" or "Breakdown" nodes unless requested. Focus on the actual movie beats.

The user's ID is "${user.sub}". You MUST pass this exact string into the 'owner_id' parameter of every tool call. Also, pass the session thread ID "${sessionId}" to the 'session_id' parameter if generating a blueprint to link history.
${canvasSystemPrompt}`,
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
    const { AgentFactory, mastra, storage } = await import("@iem/agents");
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
    const factory = new AgentFactory({
      storage: mastra.storage || mastra.config?.storage || storage,
    });
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
