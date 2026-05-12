import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const add_block = createTool({
  id: "add_block",
  description: "Add a single new block to the user's current canvas.",
  inputSchema: z.object({
    id: z
      .string()
      .describe("A unique string ID for this node (e.g., 'prose-1')"),
    type: z
      .string()
      .describe(
        "The EXACT block type ID (e.g., 'joystick', 'chunker', 'prose')",
      ),
    title: z.string().describe("Display title for the block"),
    description: z.string().describe("Description of what this block does"),
    recommended_params: z.record(z.any()).optional(),
  }),
  execute: async (args: any) => {
    return { success: true, action: "add_block", ...args.input };
  },
});

export const connect_blocks = createTool({
  id: "connect_blocks",
  description: "Connect two blocks on the user's canvas with an edge.",
  inputSchema: z.object({
    source: z.string().describe("The ID of the source node"),
    target: z.string().describe("The ID of the target node"),
    condition: z
      .string()
      .optional()
      .describe("Optional logic condition for this edge"),
  }),
  execute: async (args: any) => {
    return { success: true, action: "connect_blocks", ...args.input };
  },
});

export const update_block = createTool({
  id: "update_block",
  description:
    "Update the parameters or metadata of an existing block on the canvas.",
  inputSchema: z.object({
    id: z.string().describe("The ID of the block to update"),
    title: z.string().optional(),
    description: z.string().optional(),
    params: z.record(z.any()).optional(),
  }),
  execute: async (args: any) => {
    return { success: true, action: "update_block", ...args.input };
  },
});
