import { z } from "zod";
import { RefinerView } from "./RefinerView";
import type { BlockDefinition } from "@iem/core";

export const RefinerInput = z.object({
  text: z.string(),
  style: z.enum(["formal", "casual", "academic", "marketing", "poetic"]),
});

export const RefinerOutput = z.object({
  text: z.string(),
  model: z.string(),
  latencyMs: z.number(),
});

export const refinerBlock: BlockDefinition<
  typeof RefinerInput,
  typeof RefinerOutput
> = {
  id: "iem.core.refiner",
  name: "Refiner",
  description: "Refine text into a specific writing style.",
  category: "text",
  input: RefinerInput,
  output: RefinerOutput,
  view: RefinerView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "refine_text",
    invoke: async (input: unknown) => {
      const parsedInput = RefinerInput.parse(input);
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Refine the following text into a ${parsedInput.style} style:\n\n${parsedInput.text}`,
            stream: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({
          response: z.string(),
          model: z.string(),
        });
        const validated = apiResponseSchema.parse(data);
        return {
          text: validated.response,
          model: validated.model,
          latencyMs: Date.now() - startTime,
        };
      } catch (err) {
        throw new Error(
          `Refiner failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
  defaults: { style: "formal" },
  capabilities: ["text-transformation", "style-transfer"],
};
