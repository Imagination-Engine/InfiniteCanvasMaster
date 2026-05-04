import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
export const summarizer = createTool({
  id: "summarizer",
  description: "Summarizes text from one or more sources.",
  inputSchema: z.object({
    sources: z.array(z.string()),
    additionalInstructions: z.string().optional(),
  }),
  execute: async (input) => {
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Summarize the following sources: ${input.sources.join("\n")}. ${input.additionalInstructions || ""}`,
    });
    return { summary: text };
  },
});
export const translator = createTool({
  id: "translator",
  description: "Translates text into a target language.",
  inputSchema: z.object({
    source: z.string(),
    targetLanguage: z.string().optional().default("Spanish"),
  }),
  execute: async (input) => {
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Translate the following text to ${input.targetLanguage}: ${input.source}`,
    });
    return { translated: text };
  },
});
export const refiner = createTool({
  id: "refiner",
  description: "Refines and improves text for clarity and impact.",
  inputSchema: z.object({
    prompt: z.string(),
    context: z.string().optional(),
    language: z.string().optional(),
  }),
  execute: async (input) => {
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Refine the following text: ${input.prompt}. Context: ${input.context || "none"}. Language: ${input.language || "original"}`,
    });
    return { refined: text };
  },
});
export const colorSwapper = createTool({
  id: "colorSwapper",
  description: "Simulated tool to swap colors in an image asset.",
  inputSchema: z.object({
    image: z.string(),
    targetColor: z.string(),
    replacementColor: z.string(),
  }),
  execute: async (input) => {
    return {
      swapped: true,
      newImage: `${input.image}?swap=${input.targetColor}-to-${input.replacementColor}`,
    };
  },
});
export const formatter = createTool({
  id: "formatter",
  description: "Formats raw content into a target format (JSON, MD, CSV).",
  inputSchema: z.object({
    content: z.string(),
    targetFormat: z.string(),
  }),
  execute: async (input) => {
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Format the following content into ${input.targetFormat}: ${input.content}. Return ONLY the formatted content.`,
    });
    return { formatted: text };
  },
});
export const filterBlock = createTool({
  id: "filter",
  description:
    "Filters and transforms data collections using natural language.",
  inputSchema: z.object({
    conditions: z.string(),
    data: z.any().optional(),
  }),
  execute: async (input) => {
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Filter the following data based on these conditions: ${input.conditions}.\n\nData: ${JSON.stringify(input.data)}\n\nReturn ONLY the filtered JSON result.`,
    });
    try {
      return { filtered: JSON.parse(text) };
    } catch {
      return { filtered: text };
    }
  },
});
