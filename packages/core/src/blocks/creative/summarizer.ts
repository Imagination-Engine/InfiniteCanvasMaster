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
  description: "Summarize and analyze text or media inputs.",
  category: "text",
  input: SummarizerInput,
  output: SummarizerOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "summarize",
    invoke: async (input: unknown) => {
      const { agentRuntime } = await import("../../agent/runtime");
      const parsed = SummarizerInput.parse(input);

      const prompt = `
        Please summarize and analyze the following content. 
        Return ONLY a JSON object with two fields: 
        "summary" (a concise summary) and 
        "analysis" (deeper insights, patterns, or notable points).
        
        Additional Instructions: ${parsed.additionalInstructions || "None"}
        
        Content:
        ${parsed.text || ""}
        ${(parsed.sources || []).join("\n---\n")}
      `;

      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
      });

      try {
        // Robust JSON extraction
        let content = response.content;
        const match = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) content = match[1];

        const parsedResult = JSON.parse(content);
        return {
          summary: parsedResult.summary || "Summarization complete.",
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
