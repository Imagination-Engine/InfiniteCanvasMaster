import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const generate_canvas_blueprint = createTool({
  id: "generate_canvas_blueprint",
  description:
    "Deconstruct a user goal into a complete, interconnected canvas blueprint containing multiple blocks (nodes) and their relationships (edges). Use this to orchestrate complex solutions using the 50+ block system.",
  inputSchema: z.object({
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
    const { blueprint_name, description, nodes, edges } = inputData as any;

    // Extract userId from context (passed via handleChatStream params)
    const userId = (context as any).userId;

    if (!userId) {
      console.warn(
        "[BLUEPRINT PERSISTENCE] No userId found in context. Project may fail to persist.",
      );
    }

    // In the "Throughline" flow, this tool call is the signal to transition from
    // conversational interplay to a persisted spatial canvas.

    // We import the DB and schema dynamically to avoid circular dependencies if any
    const {
      db,
      workspaces,
      canvases,
      nodes: nodesTable,
      edges: edgesTable,
    } = await import("@iem/db");

    try {
      // 1. Create the Workspace (Project)
      const [workspace] = await db
        .insert(workspaces)
        .values({
          name: blueprint_name || "Neural Blueprint",
          ownerId: userId,
        })
        .returning();

      // 2. Create the Canvas
      const [canvas] = await db
        .insert(canvases)
        .values({
          workspaceId: workspace.id,
          name: "Main Canvas",
        })
        .returning();

      // 3. Insert Nodes
      if (nodes && nodes.length > 0) {
        await db.insert(nodesTable).values(
          nodes.map((n: any) => ({
            id: n.id,
            canvasId: canvas.id,
            type: n.type,
            data: n.data || {},
            position: n.position || { x: 0, y: 0 },
          })),
        );
      }

      // 4. Insert Edges
      if (edges && edges.length > 0) {
        await db.insert(edgesTable).values(
          edges.map((e: any) => ({
            id: e.id,
            canvasId: canvas.id,
            sourceId: e.source,
            targetId: e.target,
            data: e.data || {},
          })),
        );
      }

      return {
        success: true,
        projectId: workspace.id,
        blueprint_name,
        description,
        nodes,
        edges,
      };
    } catch (error) {
      console.error("[BLUEPRINT PERSISTENCE ERROR]:", error);
      // Fallback to returning the data so the UI can still handle it if DB fails
      return {
        success: false,
        nodes,
        edges,
        error: "Failed to persist to database",
      };
    }
  },
});
