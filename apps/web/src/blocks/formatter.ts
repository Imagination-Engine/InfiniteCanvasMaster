import { z } from "zod";
import { GenericBlockView } from "./GenericBlockView";
import type { BlockDefinition } from "../block/protocol";

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
  view: GenericBlockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "format_file",
    invoke: async (input: unknown) => {
      const parsed = FormatterInput.parse(input);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Reformat the following content into ${parsed.desiredFormat} format:\n\n${parsed.file}`,
            stream: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({ response: z.string() });
        const validated = apiResponseSchema.parse(data);
        return { formattedFile: validated.response };
      } catch (err) {
        throw new Error(
          `Formatter failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
