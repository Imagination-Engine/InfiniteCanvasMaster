// @ts-nocheck
import { z } from "zod";
export const TranslatorInput = z.object({
  text: z.string(),
  targetLanguage: z.string(),
});
export const TranslatorOutput = z.object({
  result: z.string(),
});
export const translatorBlock = {
  id: "iem.core.translator",
  name: "Translator",
  description: "Translate text.",
  category: "text",
  input: TranslatorInput,
  output: TranslatorOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "translate",
    invoke: async (input) => {
      const parsed = TranslatorInput.parse(input);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Translate the following text to ${parsed.targetLanguage}:\n\n${parsed.text}`,
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
