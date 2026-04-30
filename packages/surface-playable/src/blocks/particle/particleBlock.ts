import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const particleInput = z.object({
  payload: z.string().optional(),
});

export const particleOutput = z.object({
  success: z.boolean(),
});

export const particleBlock: BlockDefinition<
  typeof particleInput,
  typeof particleOutput
> = {
  id: "iem.playable.particle",
  name: "Particle",
  description: "Auto-generated Particle block",
  category: "uncategorized",
  input: particleInput,
  output: particleOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_particle",
    invoke: async (input: any) => {
      const parsed = particleInput.parse(input);
      return { success: true };
    },
  },
};
