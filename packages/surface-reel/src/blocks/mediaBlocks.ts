import { z } from "zod";

export interface MCPToolBinding {
  kind: "local" | "remote";
  toolName: string;
  invoke: (input: any) => Promise<any>;
}

export interface BlockDefinition<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  view: any;
  agent: MCPToolBinding;
  mode: "triggered" | "streaming" | "ambient";
}

const MockView = () => null;

export const textToImageBlock: BlockDefinition<any, any> = {
  id: "iem.reel.textToImage",
  name: "Text to Image",
  description:
    "Generates an image from text using Nanobanana (or compatible API)",
  category: "media",
  input: z.object({
    prompt: z.string().min(1, "Prompt is required"),
    style: z.string().optional(),
    apiKey: z.string().optional(), // Allow key in input
  }),
  output: z.object({
    imageUrl: z.string().url(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "generate_image",
    invoke: async (input) => {
      try {
        const apiKey =
          input.apiKey ||
          process.env.NANOBANANA_API_KEY ||
          process.env.IMAGE_API_KEY ||
          "";
        const apiUrl =
          process.env.NANOBANANA_API_URL ||
          "https://api.nanobanana.ai/v1/images/generations";

        if (!apiKey) {
          throw new Error(
            "Missing API key for image generation. Provide it in input.apiKey or NANOBANANA_API_KEY env var.",
          );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt: input.prompt,
            style: input.style || "default",
            n: 1,
            size: "1024x1024",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Image API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url || data.imageUrl;

        if (!imageUrl) {
          throw new Error("API response did not contain an image URL.");
        }

        return { imageUrl };
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Unknown image generation error",
        );
      }
    },
  },
};

export const textToSpeechBlock: BlockDefinition<any, any> = {
  id: "iem.reel.textToSpeech",
  name: "Text to Speech",
  description: "Generates audio from text using ElevenLabs",
  category: "media",
  input: z.object({
    text: z.string().min(1, "Text is required"),
    voiceId: z.string().default("EXAVITQu4vr4xnSDxMaL"), // Default to standard ElevenLabs voice ID
    apiKey: z.string().optional(), // Allow key in input
  }),
  output: z.object({
    audioUrl: z.string().url(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "generate_audio",
    invoke: async (input) => {
      try {
        const apiKey = input.apiKey || process.env.ELEVENLABS_API_KEY || "";
        const voiceId = input.voiceId || "EXAVITQu4vr4xnSDxMaL";
        const apiUrl =
          process.env.ELEVENLABS_API_URL ||
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        if (!apiKey) {
          throw new Error(
            "Missing ElevenLabs API key. Provide it in input.apiKey or ELEVENLABS_API_KEY env var.",
          );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: input.text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(
            `ElevenLabs API error ${response.status}: ${errorText}`,
          );
        }

        // ElevenLabs returns binary audio data. We convert it to a base64 data URI
        // to conform to the z.string().url() output schema without needing local disk writes.
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        const audioUrl = `data:audio/mpeg;base64,${base64Data}`;

        return { audioUrl };
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Unknown text-to-speech error",
        );
      }
    },
  },
};
