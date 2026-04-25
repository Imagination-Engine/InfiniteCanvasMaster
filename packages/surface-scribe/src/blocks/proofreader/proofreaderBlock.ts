import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const proofreaderInput = z.object({
  payload: z.string().optional(),
});

export const proofreaderOutput = z.object({
  success: z.boolean(),
  text: z.string(),
});

export const proofreaderBlock: BlockDefinition<
  typeof proofreaderInput,
  typeof proofreaderOutput
> = {
  id: "iem.scribe.proofreader",
  name: "Proofreader",
  description: "Auto-generated Proofreader block",
  category: "creative",
  input: proofreaderInput,
  output: proofreaderOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_proofreader",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Proofread and correct the following text for grammar, spelling, and punctuation: ${input.payload || ""}`,
          },
        ],
      });
      return { success: true, text: response.content };
    },
  },
};
