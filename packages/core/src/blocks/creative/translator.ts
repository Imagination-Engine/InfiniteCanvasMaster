// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const TranslatorInput = z.object({
  text: z.string().optional(),
  targetLanguage: z.string().optional(),
});

export const TranslatorOutput = z.object({
  result: z.string(),
});

export const translatorBlock: BlockDefinition<
  typeof TranslatorInput,
  typeof TranslatorOutput
> = {
  id: "iem.core.translator",
  name: "Translator",
  description: "Translate text between languages.",
  category: "text",
  input: TranslatorInput,
  output: TranslatorOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "translate_text",
    invoke: async (input: any) => {
      const text = input.text || "No text provided to translate.";
      const target = input.targetLanguage || "Spanish";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Translate the following text into ${target}:\n\n${text}`,
            stream: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({ response: z.string() });
        const validated = apiResponseSchema.parse(data);
        return { result: validated.response };
      } catch (err) {
        throw new Error(
          `Translator failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
