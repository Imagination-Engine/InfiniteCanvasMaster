import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const worldLoreInput = z.object({
  payload: z.string().optional(),
});

export const worldLoreOutput = z.object({
  success: z.boolean(),
  lore: z.string(),
});

export const worldLoreBlock: BlockDefinition<
  typeof worldLoreInput,
  typeof worldLoreOutput
> = {
  id: "iem.scribe.worldLore",
  name: "World Lore",
  description: "Auto-generated World Lore block",
  category: "creative",
  input: worldLoreInput,
  output: worldLoreOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_world_lore",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Build immersive world history and rules based on: ${input.payload || "A fantasy world."}`,
          },
        ],
      });
      return { success: true, lore: response.content };
    },
  },
};
