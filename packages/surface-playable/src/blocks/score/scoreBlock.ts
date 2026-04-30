import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const scoreInput = z.object({
  payload: z.string().optional(),
});

export const scoreOutput = z.object({
  success: z.boolean(),
});

export const scoreBlock: BlockDefinition<
  typeof scoreInput,
  typeof scoreOutput
> = {
  id: "iem.playable.score",
  name: "Score",
  description: "Auto-generated Score block",
  category: "uncategorized",
  input: scoreInput,
  output: scoreOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_score",
    invoke: async (input: any) => {
      const parsed = scoreInput.parse(input);
      return { success: true };
    },
  },
};
