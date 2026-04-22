import { z } from "zod";
import { GenericBlockView } from "./GenericBlockView";
import type { BlockDefinition } from "@iem/core";

export const SummarizerInput = z.object({
  text: z.string().optional(),
});

export const SummarizerOutput = z.object({
  summary: z.string(),
});

export const summarizerBlock: BlockDefinition<
  typeof SummarizerInput,
  typeof SummarizerOutput
> = {
  id: "iem.core.summarizer",
  name: "Summarizer",
  description: "Summarize text inputs.",
  category: "text",
  input: SummarizerInput,
  output: SummarizerOutput,
  view: GenericBlockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "summarize",
    invoke: async (input: unknown) => {
      const parsed = SummarizerInput.parse(input);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Summarize this text: ${parsed.text || ""}`,
            stream: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({ response: z.string() });
        const validated = apiResponseSchema.parse(data);
        return { summary: validated.response };
      } catch (err) {
        throw new Error(
          `Summarizer failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
