import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import crypto from "crypto";
import * as dbModule from "@iem/db";
import { eq } from "drizzle-orm";

const {
  db,
  workspaces,
  canvases,
  nodes: nodesTable,
  edges: edgesTable,
  users,
} = dbModule as any;

export const generate_canvas_blueprint = createTool({
  id: "generate_canvas_blueprint",
  description:
    "Deconstruct a user goal into a complete, interconnected canvas blueprint containing multiple blocks (nodes) and their relationships (edges). Use EXACT registry block type IDs (e.g. iem.reel.textToImage, iem.studio.video). For anime/visual scenes: create one iem.reel.textToImage per key frame with the FULL image-generation prompt in description and recommended_params.prompt; add iem.studio.video when the user wants video/reel/animation; edge each image node into the video studio for Veo forge.",
  inputSchema: z.object({
    owner_id: z
      .string()
      .describe(
        "The user ID executing this request. Always pass the exact string provided in the system prompt.",
      ),
    session_id: z
      .string()
      .optional()
      .describe(
        "The current session ID (thread ID) from the system prompt, used to link this blueprint to the ongoing conversation.",
      ),
    blueprint_name: z.string(),
    description: z.string(),
    nodes: z.array(
      z.object({
        id: z
          .string()
          .describe('A unique string ID for this node (e.g., "prose-1")'),
        type: z
          .string()
          .describe(
            'The EXACT block type ID (e.g., "joystick", "chunker", "prose")',
          ),
        title: z.string(),
        description: z.string(),
        recommended_params: z.record(z.any()).optional(),
      }),
    ),
    edges: z.array(
      z.object({
        source: z.string().describe("The ID of the source node"),
        target: z.string().describe("The ID of the target node"),
        condition: z
          .string()
          .optional()
          .describe("Optional logic condition for this edge"),
      }),
    ),
  }),
  execute: async (args: any, context?: any) => {
    const input = args.input || args;
    const { owner_id, session_id, blueprint_name, description, nodes, edges } =
      input;

    try {
      // Create the workspace using the current chat session_id to maintain continuity.
      // If the session_id is a UUID we use it, otherwise we fall back to a new one.
      const isValidUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          session_id || "",
        );
      const finalWorkspaceId = isValidUUID ? session_id : crypto.randomUUID();

      // Securely resolve owner ID from execution context if available (passed as resourceId in agent.stream)
      const contextOwnerId = context?.agent?.resourceId;
      if (contextOwnerId) {
        console.log(
          `[BLUEPRINT PERSISTENCE] Successfully resolved owner_id from Mastra context: ${contextOwnerId}`,
        );
      }
      let finalOwnerId = contextOwnerId || owner_id;
      let ownerExists = false;

      const isOwnerUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          finalOwnerId || "",
        );

      if (isOwnerUUID) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, finalOwnerId));
        if (existingUser) {
          ownerExists = true;
        }
      }

      if (!ownerExists) {
        console.warn(
          `[BLUEPRINT PERSISTENCE] owner_id "${finalOwnerId}" is not a valid UUID or does not exist. Attempting fallback...`,
        );
        // Try to fetch the first user from the users table
        const dbUsers = await db.select().from(users).limit(1);
        if (dbUsers && dbUsers.length > 0) {
          finalOwnerId = dbUsers[0].id;
          console.log(
            `[BLUEPRINT PERSISTENCE] Using fallback owner_id: ${finalOwnerId}`,
          );
        } else {
          // If no users exist, create a default system user
          const fallbackEmail = "system@balnce.ai";
          console.log(
            `[BLUEPRINT PERSISTENCE] No users found. Creating system fallback user...`,
          );

          // Check if system user already exists (might have been created previously)
          const [existingSystemUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, fallbackEmail));

          if (existingSystemUser) {
            finalOwnerId = existingSystemUser.id;
          } else {
            const [newSystemUser] = await db
              .insert(users)
              .values({
                email: fallbackEmail,
                passwordHash: "$2a$10$dummyhashplaceholderforsecurityreasons", // dummy bcrypt hash
                name: "System Operator",
              })
              .returning();
            finalOwnerId = newSystemUser.id;
          }
          console.log(
            `[BLUEPRINT PERSISTENCE] Created and using fallback owner_id: ${finalOwnerId}`,
          );
        }
      }

      const [workspace] = await db
        .insert(workspaces)
        .values({
          id: finalWorkspaceId,
          name: blueprint_name || "Neural Blueprint",
          ownerId: finalOwnerId,
        })
        .onConflictDoNothing() // In case it was already created somehow
        .returning();

      // If onConflictDoNothing returned empty, we fetch the existing one to get the ID back
      let activeWorkspaceId = workspace?.id;
      if (!activeWorkspaceId) {
        const [existing] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, finalWorkspaceId));
        activeWorkspaceId = existing.id;
      }

      let [canvas] = await db
        .select()
        .from(canvases)
        .where(eq(canvases.workspaceId, activeWorkspaceId));

      if (!canvas) {
        [canvas] = await db
          .insert(canvases)
          .values({
            workspaceId: activeWorkspaceId,
            name: "Main Canvas",
          })
          .returning();
      } else {
        // Canvas exists: Clear old nodes and edges to avoid duplication/overlapping
        await db.delete(nodesTable).where(eq(nodesTable.canvasId, canvas.id));
        await db.delete(edgesTable).where(eq(edgesTable.canvasId, canvas.id));
      }

      // Topological/Hierarchical DAG layout calculation
      const safeNodes = nodes || [];
      const safeEdges = edges || [];

      // 1. Programmatically identify if a trigger node exists in the blueprint
      const triggerTypes = new Set([
        "trigger.manual",
        "iem.conductor.webhook",
        "iem.conductor.schedule",
        "iem.conductor.trigger",
        "trigger",
      ]);
      const hasTrigger = safeNodes.some(
        (n: any) =>
          triggerTypes.has(n.type) ||
          (n.type || "").toLowerCase().includes("trigger"),
      );

      if (!hasTrigger && safeNodes.length > 0) {
        // Find "root" nodes (nodes that have no incoming edges)
        const targets = new Set(safeEdges.map((e: any) => e.target));
        const rootNodes = safeNodes.filter((n: any) => !targets.has(n.id));

        // Create a manual trigger node programmatically
        const triggerNodeId = "trigger-manual-auto-gen";
        const triggerNode = {
          id: triggerNodeId,
          type: "trigger.manual",
          title: "Start Workflow",
          description: "Manually trigger the workflow.",
          recommended_params: {
            mockInput: {
              id: "evt_do87x9yf0",
              timestamp: new Date().toISOString(),
              event: "trigger",
              payload: {
                title: "Balnce AI Launch",
                body: "Unlock your unlimited digital potential through personal agentic swarms.",
                url: "https://balnce.ai/news/launch",
                status: "active",
                score: 95,
              },
            },
          },
        };

        // Prepend it to safeNodes so it layout computes first
        safeNodes.unshift(triggerNode);

        // Add edges from manual trigger to the root nodes
        const nodesToConnect =
          rootNodes.length > 0 ? rootNodes : [safeNodes[safeNodes.length - 1]];
        nodesToConnect.forEach((n: any) => {
          safeEdges.push({
            source: triggerNodeId,
            target: n.id,
          });
        });
      }

      const nodeLevels: Record<string, number> = {};
      safeNodes.forEach((n: any) => (nodeLevels[n.id] = 0));

      // Calculate levels based on edges (longest path from root)
      let changed = true;
      let iterations = 0;
      while (changed && iterations < 100) {
        changed = false;
        safeEdges.forEach((edge: any) => {
          if (
            nodeLevels[edge.source] !== undefined &&
            nodeLevels[edge.target] !== undefined
          ) {
            if (nodeLevels[edge.target] <= nodeLevels[edge.source]) {
              nodeLevels[edge.target] = nodeLevels[edge.source] + 1;
              changed = true;
            }
          }
        });
        iterations++;
      }

      // Group nodes by level
      const levels: Record<number, string[]> = {};
      safeNodes.forEach((n: any) => {
        const lvl = nodeLevels[n.id] || 0;
        if (!levels[lvl]) levels[lvl] = [];
        levels[lvl].push(n.id);
      });

      // Assign positions
      const positions: Record<string, { x: number; y: number }> = {};
      const X_SPACING = 450;
      const Y_SPACING = 300;

      Object.entries(levels).forEach(([lvlStr, nodeIds]) => {
        const lvl = parseInt(lvlStr);
        const count = nodeIds.length;
        const totalHeight = (count - 1) * Y_SPACING;
        const startY = -(totalHeight / 2);

        nodeIds.forEach((id, index) => {
          positions[id] = {
            x: lvl * X_SPACING + 100, // offset slightly from 0
            y: startY + index * Y_SPACING + 100,
          };
        });
      });

      // Map string IDs from AI to real UUIDs for Postgres
      const idMap = new Map<string, string>();

      const mappedNodes = safeNodes.map((n: any) => {
        const realId = crypto.randomUUID();
        idMap.set(n.id, realId);
        const pos = positions[n.id] || { x: 0, y: 0 };

        return {
          id: realId,
          canvasId: canvas.id,
          type: n.type,
          data: {
            label: n.title,
            description: n.description,
            inputs: n.recommended_params || {},
          },
          positionX: pos.x,
          positionY: pos.y,
        };
      });

      if (mappedNodes.length > 0) {
        await db.insert(nodesTable).values(mappedNodes);
      }

      const mappedEdges = safeEdges
        .map((e: any) => {
          const sourceId = idMap.get(e.source);
          const targetId = idMap.get(e.target);

          if (!sourceId || !targetId) return null;

          return {
            id: crypto.randomUUID(),
            canvasId: canvas.id,
            sourceId,
            targetId,
            data: e.condition ? { condition: e.condition } : {},
          };
        })
        .filter(Boolean);

      if (mappedEdges.length > 0) {
        await db.insert(edgesTable).values(mappedEdges);
      }

      console.log(
        `[BLUEPRINT PERSISTENCE] Successfully created workspace ${activeWorkspaceId} with DAG layout`,
      );

      return {
        success: true,
        projectId: activeWorkspaceId,
        blueprint_name,
        description,
        nodes: mappedNodes,
        edges: mappedEdges,
      };
    } catch (error: any) {
      console.error("[BLUEPRINT PERSISTENCE ERROR]:", error);
      return {
        success: false,
        nodes,
        edges,
        error: error.message || "Failed to persist to database",
      };
    }
  },
});

export const configure_block = createTool({
  id: "configure_block",
  description:
    "Configure or update the parameters/settings of the active block.",
  inputSchema: z.object({
    params: z
      .record(z.any())
      .describe("The new key-value parameters to apply to the block config."),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
    return {
      success: true,
      message: "Configuration generated successfully.",
      params: input.params || {},
    };
  },
});
