import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const lightingInput = z.object({
  payload: z.string().optional(),
});

export const lightingOutput = z.object({
  success: z.boolean(),
});

export const lightingBlock: BlockDefinition<
  typeof lightingInput,
  typeof lightingOutput
> = {
  id: "iem.playable.lighting",
  name: "Lighting",
  description: "Auto-generated Lighting block",
  category: "uncategorized",
  input: lightingInput,
  output: lightingOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_lighting",
    invoke: async (input: any) => {
      const parsed = lightingInput.parse(input);
      return { success: true };
    },
  },
};
