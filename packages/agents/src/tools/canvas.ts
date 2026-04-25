import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import crypto from "crypto";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

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
        recommended_params: z.record(z.string(), z.any()).optional(),
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
  execute: async (inputData, { mastra, ...context }) => {
    const { owner_id, blueprint_name, description, nodes, edges } =
      inputData as any;

    let dbClient;
    try {
      const {
        workspaces,
        canvases,
        nodes: nodesTable,
        edges: edgesTable,
      } = await import("@iem/db");

      dbClient = new Client({ connectionString: process.env.DATABASE_URL });
      await dbClient.connect();
      const db = drizzle(dbClient);

      const [workspace] = await db
        .insert(workspaces)
        .values({
          name: blueprint_name || "Neural Blueprint",
          ownerId: owner_id,
        })
        .returning();

      const [canvas] = await db
        .insert(canvases)
        .values({
          workspaceId: workspace.id,
          name: "Main Canvas",
        })
        .returning();

      // Map string IDs from AI to real UUIDs for Postgres
      const idMap = new Map<string, string>();

      const mappedNodes = (nodes || []).map((n: any) => {
        const realId = crypto.randomUUID();
        idMap.set(n.id, realId);
        return {
          id: realId,
          canvasId: canvas.id,
          type: n.type,
          data: {
            label: n.title,
            description: n.description,
            inputs: n.recommended_params || {},
          },
          positionX: 0,
          positionY: 0,
        };
      });

      if (mappedNodes.length > 0) {
        await db.insert(nodesTable).values(mappedNodes);
      }

      // Map edges to use the real UUIDs
      const mappedEdges = (edges || [])
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
        `[BLUEPRINT PERSISTENCE] Successfully created workspace ${workspace.id}`,
      );

      return {
        success: true,
        projectId: workspace.id,
        blueprint_name,
        description,
        nodes,
        edges,
      };
    } catch (error: any) {
      console.error("[BLUEPRINT PERSISTENCE ERROR]:", error);
      return {
        success: false,
        nodes,
        edges,
        error: error.message || "Failed to persist to database",
      };
    } finally {
      if (dbClient) {
        await dbClient.end();
      }
    }
  },
});
