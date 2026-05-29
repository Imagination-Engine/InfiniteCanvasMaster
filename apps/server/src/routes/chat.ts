import { Hono } from "hono";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  workspaces,
  canvases,
  nodes as nodesTable,
  edges as edgesTable,
  users,
} from "@iem/db";

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
    const { createOrchestrator, mastra } = await import("@iem/agents");
    const agent = await createOrchestrator(mastra.storage);

    let canvasSystemPrompt = "";
    if (body.canvasContext) {
      canvasSystemPrompt = `\n\nCURRENT CANVAS STATE:\nNodes: ${JSON.stringify(body.canvasContext.nodes)}\nEdges: ${JSON.stringify(body.canvasContext.edges)}\nBe aware of these existing nodes and connections when suggesting changes, discussing the workspace, or generating blueprints. You are contiguous with the canvas experience.`;
    }

    // Pass the ENTIRE message history from the UI (which already contains the context),
    // and prepend the dynamic system message so the model has the rules.
    const finalMessages = [
      {
        role: "system",
        content: `You are the Imagination Engine Orchestrator. 
CRITICAL MISSION: When a user describes a goal, idea, or request, you MUST deconstruct it into a functional architecture and call the 'generate_canvas_blueprint' tool to place blocks on the canvas. 

The user's ID is "${user.sub}". You MUST pass this exact string into the 'owner_id' parameter of every tool call. Also, pass the session thread ID "${sessionId}" to the 'session_id' parameter if generating a blueprint to link history.

Identify the best blocks from the registry (scribe, playable, reel, forge, atlas, workflow) to represent the solution. Wire them together using edges to form a logical flow.${canvasSystemPrompt}`,
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

export { chatRouter };
