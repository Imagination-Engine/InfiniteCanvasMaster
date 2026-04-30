import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const summarizer = createTool({
  id: "summarizer",
  description: "Summarize and analyze mixed media inputs (text, audio, image).",
  inputSchema: z.object({
    sources: z.array(z.string()),
    additionalInstructions: z.string().optional(),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Summarize and analyze the following content. Return ONLY a JSON object with two fields: "summary" (a concise summary) and "analysis" (deeper insights, patterns, or notable points).
      Instructions: ${input.additionalInstructions || "None"}
      Content: ${input.sources.join("\n\n")}`,
    });
    try {
      return JSON.parse(text);
    } catch {
      return { summary: text, analysis: "Analysis provided in summary." };
    }
  },
});

export const translator = createTool({
  id: "translator",
  description: "Translate text/audio to a target language.",
  inputSchema: z.object({
    source: z.string(),
    targetLanguage: z.string().default("English"),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Translate the following text to ${input.targetLanguage}. Return ONLY a JSON object with two fields: "detectedLanguage" and "translation".
      Text: ${input.source}`,
    });
    try {
      return JSON.parse(text);
    } catch {
      return { translation: text, detectedLanguage: "Unknown" };
    }
  },
});

export const programmer = createTool({
  id: "programmer",
  description:
    "Generate production-grade code based on a prompt and technical requirements.",
  inputSchema: z.object({
    prompt: z.string(),
    language: z.string().default("typescript"),
    context: z.string().optional(),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `You are an elite software engineer. Generate a high-quality ${input.language} code snippet for the following requirement: ${input.prompt}. 
      Context: ${input.context || "None"}
      Return ONLY the code, no markdown blocks unless requested.`,
    });
    return { generatedCode: text };
  },
});

export const colorSwapper = createTool({
  id: "colorSwapper",
  description:
    "Analyze an image and swap specific colors or describe a color transformation.",
  inputSchema: z.object({
    image: z.string().describe("Base64 image data or URL"),
    targetColor: z.string(),
    replacementColor: z.string(),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
    // For now, we simulate the color swap via description as we don't have a direct pixel manipulation tool yet
    // In a production environment, this would call a specialized image processing service.
    return {
      status: "simulated",
      message: `Color swap from ${input.targetColor} to ${input.replacementColor} requested for provided image.`,
      image: input.image,
    };
  },
});

export const formatter = createTool({
  id: "formatter",
  description:
    "Format data or text into a specific target format (JSON, Markdown, CSV, etc.)",
  inputSchema: z.object({
    content: z.string(),
    targetFormat: z.string(),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      prompt: `Format the following content into ${input.targetFormat}. Ensure it is valid and clean.\n\nContent: ${input.content}`,
    });
    return { formattedContent: text };
  },
});

export const filter = createTool({
  id: "filter",
  description: "Filter a dataset or text based on specific conditions.",
  inputSchema: z.object({
    data: z.any(),
    conditions: z.string(),
  }),
  execute: async (args: any) => {
    const input = args.input || args;
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
