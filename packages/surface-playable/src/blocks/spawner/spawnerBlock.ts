import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const spawnerInput = z.object({
  payload: z.string().optional(),
});

export const spawnerOutput = z.object({
  success: z.boolean(),
});

export const spawnerBlock: BlockDefinition<
  typeof spawnerInput,
  typeof spawnerOutput
> = {
  id: "iem.playable.spawner",
  name: "Spawner",
  description: "Auto-generated Spawner block",
  category: "uncategorized",
  input: spawnerInput,
  output: spawnerOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_spawner",
    invoke: async (input: any) => {
      const parsed = spawnerInput.parse(input);
      return { success: true };
    },
  },
};
