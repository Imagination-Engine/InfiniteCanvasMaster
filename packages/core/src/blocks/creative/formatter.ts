// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const FormatterInput = z.object({
  file: z.string().optional(),
  desiredFormat: z.string().optional(),
});

export const FormatterOutput = z.object({
  formattedFile: z.string(),
});

export const formatterBlock: BlockDefinition<
  typeof FormatterInput,
  typeof FormatterOutput
> = {
  id: "iem.core.formatter",
  name: "Formatter",
  description: "Reformat code or documents.",
  category: "utility",
  input: FormatterInput,
  output: FormatterOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "format_content",
    invoke: async (input: any) => ({
      formattedFile: `Formatted ${input.file || "content"} to ${input.desiredFormat || "JSON"}`,
    }),
  },
};
