import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

export const proseBlock: BlockDefinition<any, any> = {
  id: "iem.scribe.prose",
  name: "Prose",
  description: "Auto-generated Prose block",
  category: "creative",
  input: z.object({
    payload: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    text: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_prose",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Generate a high-quality prose based on the following: ${input.payload || "Write something creative."}`,
          },
        ],
      });
      return { success: true, text: response.content };
    },
  },
};
