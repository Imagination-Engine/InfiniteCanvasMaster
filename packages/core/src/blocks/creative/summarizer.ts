// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const SummarizerInput = z.object({
  text: z.string().optional(),
  sources: z.array(z.string()).optional(),
  additionalInstructions: z.string().optional(),
});

export const SummarizerOutput = z.object({
  summary: z.string(),
  analysis: z.string(),
});

export const summarizerBlock: BlockDefinition<
  typeof SummarizerInput,
  typeof SummarizerOutput
> = {
  id: "iem.core.summarizer",
  name: "Summarizer",
  description: "Summarize text from one or more sources.",
  category: "text",
  input: SummarizerInput,
  output: SummarizerOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "summarize_text",
    invoke: async (input: any) => {
      const text =
        input.text ||
        (input.sources
          ? input.sources.join("\n")
          : "No content provided to summarize.");
      const instructions = input.additionalInstructions || "";

      const { agentRuntime } = await import("../../agent/runtime");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Summarize this content: ${text}. ${instructions}\n\nReturn a JSON object with "summary" and "analysis".`,
          },
        ],
      });

      try {
        const parsedResult = JSON.parse(response.content);
        return {
          summary: parsedResult.summary || response.content,
          analysis: parsedResult.analysis || "Analysis complete.",
        };
      } catch (e) {
        return {
          summary: response.content,
          analysis: "Extracted from raw response.",
        };
      }
    },
  },
};
