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
} = dbModule;
export const generate_canvas_blueprint = createTool({
  id: "generate_canvas_blueprint",
  description:
    "Deconstruct a user goal into a complete, interconnected canvas blueprint containing multiple blocks (nodes) and their relationships (edges). Use this to orchestrate complex solutions using the 50+ block system.",
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
  execute: async (args) => {
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
      const [workspace] = await db
        .insert(workspaces)
        .values({
          id: finalWorkspaceId,
          name: blueprint_name || "Neural Blueprint",
          ownerId: owner_id,
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
      const [canvas] = await db
        .insert(canvases)
        .values({
          workspaceId: activeWorkspaceId,
          name: "Main Canvas",
        })
        .returning();
      // Topological/Hierarchical DAG layout calculation
      const safeNodes = nodes || [];
      const safeEdges = edges || [];
      const nodeLevels = {};
      safeNodes.forEach((n) => (nodeLevels[n.id] = 0));
      // Calculate levels based on edges (longest path from root)
      let changed = true;
      let iterations = 0;
      while (changed && iterations < 100) {
        changed = false;
        safeEdges.forEach((edge) => {
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
      const levels = {};
      safeNodes.forEach((n) => {
        const lvl = nodeLevels[n.id] || 0;
        if (!levels[lvl]) levels[lvl] = [];
        levels[lvl].push(n.id);
      });
      // Assign positions
      const positions = {};
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
      const idMap = new Map();
      const mappedNodes = safeNodes.map((n) => {
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
        .map((e) => {
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
        nodes,
        edges,
      };
    } catch (error) {
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
