// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const FormatterInput = z.object({
  file: z.string(),
  desiredFormat: z.string(),
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
  description: "Format files.",
  category: "data",
  input: FormatterInput,
  output: FormatterOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "format_file",
    invoke: async (input: unknown) => {
      const parsed = FormatterInput.parse(input);
      try {
        const { agentRuntime } = await import("../../agent/runtime");
        const response = await agentRuntime.chat({
          model: "gemini-2.5-pro",
          messages: [
            {
              role: "user",
              content: `Reformat the following content into ${parsed.desiredFormat} format. Return ONLY the formatted output without markdown blocks if possible:\n\n${parsed.file}`,
            },
          ],
        });

        return { formattedFile: response.content };
      } catch (err) {
        throw new Error(
          `Formatter failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
  },
};
