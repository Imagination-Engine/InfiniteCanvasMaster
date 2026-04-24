import { z } from "zod";
import { BlockDefinition, MCPToolBinding } from "@iem/core";

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
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
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
