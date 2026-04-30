import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const timerInput = z.object({
  payload: z.string().optional(),
});

export const timerOutput = z.object({
  success: z.boolean(),
});

export const timerBlock: BlockDefinition<
  typeof timerInput,
  typeof timerOutput
> = {
  id: "iem.playable.timer",
  name: "Timer",
  description: "Auto-generated Timer block",
  category: "uncategorized",
  input: timerInput,
  output: timerOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_timer",
    invoke: async (input: any) => {
      const parsed = timerInput.parse(input);
      return { success: true };
    },
  },
};
