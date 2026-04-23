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
  execute: async (inputData, { mastra }) => {
    const { nodes, edges } = inputData as any;

    // In a real execution, we would persist this to the database
    // We can access the storage from mastra if needed, or use drizzle directly
    const threadId = (mastra as any).threadId; // Mastra passes this in some contexts

    // For now, returning it is enough as the Vercel AI SDK
    // will receive the 'result' state of the tool invocation.
    return { success: true, nodes, edges };
  },
});
