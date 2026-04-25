import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const documentLoaderInput = z.object({
  payload: z.string().optional(),
});

export const documentLoaderOutput = z.object({
  success: z.boolean(),
});

export const documentLoaderBlock: BlockDefinition<
  typeof documentLoaderInput,
  typeof documentLoaderOutput
> = {
  id: "iem.atlas.documentLoader",
  name: "DocumentLoader",
  description: "Auto-generated DocumentLoader block",
  category: "uncategorized",
  input: documentLoaderInput,
  output: documentLoaderOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_documentLoader",
    invoke: async (input: any) => {
      const parsed = documentLoaderInput.parse(input);
      return { success: true };
    },
  },
};
