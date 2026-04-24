import { z } from "zod";
import { BlockDefinition, MCPToolBinding } from "@iem/core";

export const chapterBlock: BlockDefinition<any, any> = {
  id: "iem.scribe.chapter",
  name: "Chapter",
  description: "Auto-generated Chapter block",
  category: "creative",
  input: z.object({
    title: z.string().optional(),
    outline: z.string().optional(),
    payload: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    text: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_chapter",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        messages: [
          {
            role: "user",
            content: `Draft a chapter for a story titled "${input.title || "Untitled"}". 
            Outline: ${input.outline || "None"}. 
            Additional Context: ${input.payload || "None"}.`,
          },
        ],
      });
      return { success: true, text: response.content };
    },
  },
};
