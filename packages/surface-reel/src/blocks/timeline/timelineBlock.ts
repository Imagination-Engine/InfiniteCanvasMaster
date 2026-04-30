import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const timelineInput = z.object({
  payload: z.string().optional(),
});

export const timelineOutput = z.object({
  success: z.boolean(),
});

export const timelineBlock: BlockDefinition<
  typeof timelineInput,
  typeof timelineOutput
> = {
  id: "iem.reel.timeline",
  name: "Timeline",
  description: "Auto-generated Timeline block",
  category: "uncategorized",
  input: timelineInput,
  output: timelineOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_timeline",
    invoke: async (input: any) => {
      const parsed = timelineInput.parse(input);
      return { success: true };
    },
  },
};
