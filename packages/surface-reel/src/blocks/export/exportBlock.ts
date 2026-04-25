import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const exportInput = z.object({
  payload: z.string().optional(),
});

export const exportOutput = z.object({
  success: z.boolean(),
});

export const exportBlock: BlockDefinition<
  typeof exportInput,
  typeof exportOutput
> = {
  id: "iem.reel.export",
  name: "Export",
  description: "Auto-generated Export block",
  category: "uncategorized",
  input: exportInput,
  output: exportOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_export",
    invoke: async (input: any) => {
      const parsed = exportInput.parse(input);
      return { success: true };
    },
  },
};
