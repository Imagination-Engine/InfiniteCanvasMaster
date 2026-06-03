// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const FilterInput = z.object({
  source: z.string().optional(),
  conditions: z.string().optional(),
});

export const FilterOutput = z.object({
  filtered: z.string(),
});

export const filterBlock: BlockDefinition<
  typeof FilterInput,
  typeof FilterOutput
> = {
  id: "iem.core.filter",
  name: "Filter",
  description: "Filter and transform data collections.",
  category: "data",
  input: FilterInput,
  output: FilterOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "filter_data",
    invoke: async (input: any) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Filter this data: ${input.source || "[]"} based on: ${input.conditions || "no conditions"}. Return ONLY the filtered result.`,
            stream: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({ response: z.string() });
        const validated = apiResponseSchema.parse(data);
        return { filtered: validated.response };
      } catch (err) {
        throw new Error(
          `Filter failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
