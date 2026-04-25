import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const dialogueTreeInput = z.object({
  payload: z.string().optional(),
});

export const dialogueTreeOutput = z.object({
  success: z.boolean(),
  tree: z.record(z.any()),
});

export const dialogueTreeBlock: BlockDefinition<
  typeof dialogueTreeInput,
  typeof dialogueTreeOutput
> = {
  id: "iem.scribe.dialogueTree",
  name: "Dialogue Tree",
  description: "Auto-generated Dialogue Tree block",
  category: "creative",
  input: dialogueTreeInput,
  output: dialogueTreeOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_dialogue_tree",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Generate a branching dialogue tree based on: ${input.payload || "A greeting."}. Return ONLY a JSON object.`,
          },
        ],
      });
      try {
        return { success: true, tree: JSON.parse(response.content) };
      } catch {
        return { success: true, tree: { raw: response.content } };
      }
    },
  },
};
