import { z } from "zod";
import { BlockDefinition, MCPToolBinding } from "@iem/core";

export const proseBlock: BlockDefinition<any, any> = {
  id: "iem.scribe.prose",
  name: "Prose",
  description: "Auto-generated Prose block",
  category: "uncategorized",
  input: z.object({
    payload: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_prose",
    invoke: async (input) => {
      const { generateText } = await import("ai");
      const { google } = await import("@ai-sdk/google");
      const { text } = await generateText({
        model: google("gemini-2.5-pro"),
        prompt: `Generate a high-quality prose based on the following: ${input.payload || "Write something creative."}`,
      });
      return { success: true, text };
    },
  },
};
