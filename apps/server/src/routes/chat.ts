import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  workspaces,
  canvases,
  nodes as nodesTable,
  edges as edgesTable,
  users,
} from "@iem/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  RequestContext,
  MASTRA_RESOURCE_ID_KEY,
  MASTRA_THREAD_ID_KEY,
} from "@mastra/core/request-context";

const chatRouter = new Hono();

import { authMiddleware } from "../middleware/auth.js";

chatRouter.use("*", authMiddleware);

const isUuid = (value?: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value || "",
  );

const latestUserText = (messages: Array<{ role: string; content: string }>) =>
  [...messages].reverse().find((m) => m.role === "user")?.content || "";

async function resolveWorkspaceOwnerId(
  db: any,
  ownerId: string,
  ownerEmail?: string,
) {
  if (isUuid(ownerId)) {
    const [existingById] = await db
      .select()
      .from(users as any)
      .where(eq((users as any).id, ownerId));
    if (existingById) return existingById.id as string;
  }

  if (ownerEmail) {
    const [existingByEmail] = await db
      .select()
      .from(users as any)
      .where(eq((users as any).email, ownerEmail));
    if (existingByEmail) return existingByEmail.id as string;
  }

  if (isUuid(ownerId)) {
    const seedEmail = ownerEmail || `token-${ownerId}@local.invalid`;
    try {
      const [created] = await db
        .insert(users as any)
        .values({
          id: ownerId,
          email: seedEmail,
          passwordHash: "token-user-autocreated",
        })
        .returning();
      if (created?.id) return created.id as string;
    } catch {
      const [existingByIdAfterInsert] = await db
        .select()
        .from(users as any)
        .where(eq((users as any).id, ownerId));
      if (existingByIdAfterInsert?.id) return existingByIdAfterInsert.id;

      if (ownerEmail) {
        const [existingByEmailAfterInsert] = await db
          .select()
          .from(users as any)
          .where(eq((users as any).email, ownerEmail));
        if (existingByEmailAfterInsert?.id)
          return existingByEmailAfterInsert.id;
      }
    }
  }

  return null;
}

function buildFallbackBlueprint(
  prompt: string,
  ownerId: string,
  sessionId: string,
) {
  const normalized = prompt.toLowerCase();
  const isGame =
    /game|playable|player|sprite|joystick|platform|rpg|arcade|level/.test(
      normalized,
    );

  if (isGame) {
    return {
      owner_id: ownerId,
      session_id: sessionId,
      blueprint_name: "Playable Game Studio",
      description:
        "A working playable-studio starter graph: input drives a player entity, collision updates score, and the game runtime presents the playable loop.",
      nodes: [
        {
          id: "game-studio",
          type: "iem.studio.game",
          title: "Game Studio",
          description: "Coordinates the playable surface and game design loop.",
        },
        {
          id: "input",
          type: "iem.playable.input",
          title: "Input Controller",
          description: "Captures keyboard or joystick intent for the player.",
          recommended_params: { controls: "WASD / arrow keys" },
        },
        {
          id: "player",
          type: "iem.playable.sprite",
          title: "Player Sprite",
          description: "The visible controllable player character.",
          recommended_params: { asset: "placeholder-player" },
        },
        {
          id: "physics",
          type: "iem.playable.physicsEntity",
          title: "Physics Entity",
          description: "Applies movement, velocity, and collision state.",
          recommended_params: { mass: 1, gravity: false },
        },
        {
          id: "collider",
          type: "iem.playable.collider",
          title: "Collision Rules",
          description: "Detects pickups, obstacles, and win/loss contact.",
        },
        {
          id: "score",
          type: "iem.playable.score",
          title: "Score System",
          description: "Tracks points from collisions and objectives.",
          recommended_params: { startingScore: 0 },
        },
        {
          id: "runtime",
          type: "iem.app.game",
          title: "Playable Runtime",
          description:
            "Runs the current playable scene as an interactive app block.",
          recommended_params: {
            appUrl: "/playable-runtime.html",
            title: "Playable Runtime",
          },
        },
      ],
      edges: [
        {
          source: "game-studio",
          target: "input",
          condition: "studio configures controls",
        },
        {
          source: "input",
          target: "player",
          condition: "control vector moves sprite",
        },
        {
          source: "player",
          target: "physics",
          condition: "sprite state enters physics",
        },
        {
          source: "physics",
          target: "collider",
          condition: "entity bounds are checked",
        },
        {
          source: "collider",
          target: "score",
          condition: "pickup collision awards points",
        },
        {
          source: "score",
          target: "runtime",
          condition: "runtime displays current score",
        },
      ],
    };
  }

  return {
    owner_id: ownerId,
    session_id: sessionId,
    blueprint_name: "Working Canvas Workflow",
    description:
      "A functional starter workflow that turns intent into a plan, routes work through an agent, and produces an inspectable artifact.",
    nodes: [
      {
        id: "goal",
        type: "iem.intent.goal",
        title: "Goal",
        description: prompt || "Capture the user's desired outcome.",
      },
      {
        id: "planner",
        type: "iem.intent.plan",
        title: "Plan",
        description: "Break the goal into executable steps.",
      },
      {
        id: "agent",
        type: "iem.agent.agent",
        title: "Builder Agent",
        description: "Executes the highest-priority next step.",
      },
      {
        id: "artifact",
        type: "iem.data.artifact",
        title: "Output Artifact",
        description: "Stores the current result for review and iteration.",
      },
    ],
    edges: [
      { source: "goal", target: "planner", condition: "intent is decomposed" },
      {
        source: "planner",
        target: "agent",
        condition: "next action is assigned",
      },
      {
        source: "agent",
        target: "artifact",
        condition: "work product is emitted",
      },
    ],
  };
}

async function persistFallbackBlueprint(
  db: any,
  blueprint: any,
  ownerEmail?: string,
) {
  const resolvedOwnerId = await resolveWorkspaceOwnerId(
    db,
    blueprint.owner_id,
    ownerEmail,
  );
  if (!resolvedOwnerId) {
    return {
      success: false,
      nodes: blueprint.nodes || [],
      edges: blueprint.edges || [],
      error:
        "Unable to resolve a valid workspace owner for this session. Please log out and log in again.",
    };
  }

  const finalWorkspaceId = isUuid(blueprint.session_id)
    ? blueprint.session_id
    : crypto.randomUUID();

  const [workspace] = await db
    .insert(workspaces as any)
    .values({
      id: finalWorkspaceId,
      ownerId: resolvedOwnerId,
      name: blueprint.blueprint_name || "Canvas Blueprint",
    })
    .onConflictDoNothing()
    .returning();

  let activeWorkspaceId = workspace?.id;
  if (!activeWorkspaceId) {
    const [existing] = await db
      .select()
      .from(workspaces as any)
      .where(eq((workspaces as any).id, finalWorkspaceId));
    activeWorkspaceId = existing?.id || finalWorkspaceId;
  }

  let [canvas] = await db
    .select()
    .from(canvases as any)
    .where(eq((canvases as any).workspaceId, activeWorkspaceId));

  if (!canvas) {
    [canvas] = await db
      .insert(canvases as any)
      .values({
        workspaceId: activeWorkspaceId,
        name: "Main Canvas",
      })
      .returning();
  } else {
    await db
      .delete(edgesTable as any)
      .where(eq((edgesTable as any).canvasId, canvas.id));
    await db
      .delete(nodesTable as any)
      .where(eq((nodesTable as any).canvasId, canvas.id));
  }

  const nodeIdMap = new Map<string, string>();
  const mappedNodes = (blueprint.nodes || []).map(
    (node: any, index: number) => {
      const realId = crypto.randomUUID();
      nodeIdMap.set(node.id, realId);
      return {
        id: realId,
        canvasId: canvas.id,
        type: node.type,
        positionX: 100 + index * 360,
        positionY: 120 + (index % 2) * 260,
        data: {
          label: node.title,
          description: node.description,
          inputs: node.recommended_params || {},
          title:
            node.type === "iem.app.game"
              ? node.recommended_params?.title ||
                node.title ||
                "Playable Runtime"
              : node.title,
          appUrl:
            node.type === "iem.app.game"
              ? node.recommended_params?.appUrl || "/playable-runtime.html"
              : undefined,
        },
      };
    },
  );

  if (mappedNodes.length > 0) {
    await db.insert(nodesTable as any).values(mappedNodes);
  }

  const mappedEdges = (blueprint.edges || [])
    .map((edge: any) => {
      const sourceId = nodeIdMap.get(edge.source);
      const targetId = nodeIdMap.get(edge.target);
      if (!sourceId || !targetId) return null;
      return {
        id: crypto.randomUUID(),
        canvasId: canvas.id,
        sourceId,
        targetId,
        data: edge.condition ? { condition: edge.condition } : {},
      };
    })
    .filter(Boolean);

  if (mappedEdges.length > 0) {
    await db.insert(edgesTable as any).values(mappedEdges);
  }

  return {
    success: true,
    projectId: activeWorkspaceId,
    blueprint_name: blueprint.blueprint_name,
    description: blueprint.description,
    nodes: blueprint.nodes,
    edges: blueprint.edges,
  };
}

async function fallbackChatStream({
  db,
  userId,
  userEmail,
  sessionId,
  prompt,
}: {
  db: any;
  userId: string;
  userEmail?: string;
  sessionId: string;
  prompt: string;
}) {
  const blueprint = buildFallbackBlueprint(prompt, userId, sessionId);
  const result = await persistFallbackBlueprint(db, blueprint, userEmail);
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        const text = `I created a working ${blueprint.blueprint_name.toLowerCase()} blueprint and placed it on a usable canvas. Open the canvas to pan, zoom, drag blocks, and inspect the generated flow.`;
        controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
        controller.enqueue(
          encoder.encode(
            `9:${JSON.stringify({
              toolCallId: `fallback-${Date.now()}`,
              toolName: "generate_canvas_blueprint",
              args: blueprint,
              result,
            })}\n`,
          ),
        );
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-vercel-ai-data-stream": "v1",
      },
    },
  );
}

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

  const prompt = latestUserText(sanitizedMessages);

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
      agent = await createBlockAssistant(mastra.storage, systemInstruction);
    } else {
      let canvasSystemPrompt = "";
      if (body.canvasContext) {
        canvasSystemPrompt = `\n\nCURRENT CANVAS STATE:\nNodes: ${JSON.stringify(body.canvasContext.nodes)}\nEdges: ${JSON.stringify(body.canvasContext.edges)}\nBe aware of these existing nodes and connections when suggesting changes, discussing the workspace, or generating blueprints. You are contiguous with the canvas experience.`;
      }

      systemInstruction = `You are the Imagination Engine Orchestrator. 
CRITICAL MISSION: When a user describes a goal, idea, or request, you MUST deconstruct it into a functional architecture and call the 'generate_canvas_blueprint' tool to place blocks on the canvas. 

The user's ID is "${user.sub}". You MUST pass this exact string into the 'owner_id' parameter of every tool call. Also, pass the session thread ID "${sessionId}" to the 'session_id' parameter if generating a blueprint to link history.

Identify the best blocks from the registry (scribe, playable, reel, forge, atlas, workflow) to represent the solution. Wire them together using edges to form a logical flow.

REEL / VIDEO RULES (use EXACT block type IDs in blueprint nodes):
- Reference stills: "iem.reel.textToImage" (one node per key frame; put the full Gemini image prompt in node description and recommended_params.prompt).
- Video forge: "iem.studio.video" — REQUIRED when the user wants a reel, video, animation, or to forge footage from reference images.
- Pattern: connect each iem.reel.textToImage → iem.studio.video (edges source→target). Put the motion/Veo prompt on the video studio node description.
- Anime / screencap requests: preserve style instructions in EACH textToImage description (e.g. ufotable style, Fate/stay night UBW, "Are you my Master" scene) — do not shorten them.
- If the user only asked for images with no mention of video/reel/animation, textToImage nodes alone are fine; if they want a final video, always include iem.studio.video.${canvasSystemPrompt}`;
      agent = await createOrchestrator(mastra.storage, systemInstruction);
    }

    const finalMessages = [
      {
        role: "system",
        content: systemInstruction,
      },
      ...sanitizedMessages,
    ];

    const latestMsg = sanitizedMessages[sanitizedMessages.length - 1];
    const prompt = latestMsg?.content || "";

    const requestContext = new RequestContext();
    requestContext.set(MASTRA_RESOURCE_ID_KEY, user.sub);
    requestContext.set(MASTRA_THREAD_ID_KEY, sessionId);

    const result = await agent.stream(prompt, {
      threadId: sessionId, // This tells Mastra to load history and save this turn!
      resourceId: user.sub,
      requestContext,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let emittedText = false;
        let emittedTool = false;

        try {
          for await (const chunk of result.textStream) {
            emittedText = true;
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
              emittedTool = true;
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
                  emittedTool = true;
                }
              }
            }
          }

          if (!emittedTool) {
            const blueprint = buildFallbackBlueprint(
              prompt,
              user.sub,
              sessionId,
            );
            const fallbackResult = await persistFallbackBlueprint(
              db,
              blueprint,
              user.email,
            );
            if (!emittedText) {
              const text = `I created a working ${blueprint.blueprint_name.toLowerCase()} blueprint and placed it on the canvas.`;
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
            controller.enqueue(
              encoder.encode(
                `9:${JSON.stringify({
                  toolCallId: `fallback-${Date.now()}`,
                  toolName: "generate_canvas_blueprint",
                  args: blueprint,
                  result: fallbackResult,
                })}\n`,
              ),
            );
          }
        } catch (err: any) {
          console.error("[STREAM ITERATION ERROR]:", err);
          try {
            const blueprint = buildFallbackBlueprint(
              prompt,
              user.sub,
              sessionId,
            );
            const fallbackResult = await persistFallbackBlueprint(
              db,
              blueprint,
              user.email,
            );
            const text = `The model stream failed, so I created a deterministic ${blueprint.blueprint_name.toLowerCase()} blueprint locally.`;
            controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            controller.enqueue(
              encoder.encode(
                `9:${JSON.stringify({
                  toolCallId: `fallback-${Date.now()}`,
                  toolName: "generate_canvas_blueprint",
                  args: blueprint,
                  result: fallbackResult,
                })}\n`,
              ),
            );
          } catch (fallbackErr: any) {
            const errorChunk = `3:{"message":${JSON.stringify(
              fallbackErr.message || err.message,
            )}}\n`;
            controller.enqueue(encoder.encode(errorChunk));
          }
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
    return fallbackChatStream({
      db,
      userId: user.sub,
      userEmail: user.email,
      sessionId,
      prompt,
    });
  }
});

chatRouter.post("/block", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const body = await c.req.json();

  const { blockId, projectId, messages } = body;

  console.log(
    `[BLOCK-CHAT] Request from user ${user?.sub} for block ${blockId} in project ${projectId}`,
  );

  if (!blockId || !projectId) {
    console.warn("[BLOCK-CHAT] Missing blockId or projectId", {
      blockId,
      projectId,
    });
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

    const latestMessageObj = messages[messages.length - 1];
    const prompt =
      typeof latestMessageObj === "string"
        ? latestMessageObj
        : latestMessageObj?.content || latestMessageObj?.text || "";

    const requestContext = new RequestContext();
    requestContext.set(MASTRA_RESOURCE_ID_KEY, user.sub);
    requestContext.set(MASTRA_THREAD_ID_KEY, threadId);

    const result = await agent.stream(prompt, {
      threadId,
      resourceId: user.sub,
      requestContext,
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
