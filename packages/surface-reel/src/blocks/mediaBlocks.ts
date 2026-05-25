import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";
import { generateGeminiImage, geminiImageToDataUrl } from "@iem/core";

export const timelineBlock: BlockDefinition<any, any> = {
  id: "iem.reel.timeline",
  name: "Timeline",
  description: "Sequence video events.",
  category: "media",
  input: z.object({ events: z.array(z.any()) }),
  output: z.object({ sequenceId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "seq_events",
    invoke: async () => ({ sequenceId: "seq_1" }),
  },
};

export const exportBlock: BlockDefinition<any, any> = {
  id: "iem.reel.export",
  name: "Export",
  description: "Final render and export pipeline.",
  category: "media",
  input: z.object({ format: z.enum(["mp4", "gif", "mov"]) }),
  output: z.object({ fileUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "render",
    invoke: async () => ({ fileUrl: "http://export.mp4" }),
  },
};

export const sceneBlock: BlockDefinition<any, any> = {
  id: "iem.reel.scene",
  name: "Scene",
  description: "Composes an image, dialogue, and duration on the timeline.",
  category: "media",
  input: z.object({
    imageUrl: z.string().url().optional(),
    dialogueUrl: z.string().optional(),
    durationMs: z.number().min(100).default(3000),
    description: z.string().optional(),
  }),
  output: z.object({
    sceneId: z.string(),
    thumbnailUrl: z.string().optional(),
    durationMs: z.number(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_scene",
    invoke: async (input: any) => ({
      sceneId: `scene_${Date.now()}`,
      thumbnailUrl:
        input.imageUrl ||
        "https://placehold.co/600x400/222/FFF?text=No+Image+Provided",
      durationMs: input.durationMs || 3000,
    }),
  },
};

export const characterBlock: BlockDefinition<any, any> = {
  id: "iem.reel.character",
  name: "Character",
  description: "Visual character in scene.",
  category: "media",
  input: z.object({ prompt: z.string() }),
  output: z.object({
    characterId: z.string(),
    imageUrl: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_char",
    invoke: async (input: any) => {
      const characterId = `char_${Date.now()}`;

      if (process.env.IEM_MOCK_MODELS === "1") {
        return {
          characterId,
          imageUrl: "https://placehold.co/600x400/png?text=Mock+Character",
        };
      }

      const apiKey =
        process.env.NANOBANANA_API_KEY || process.env.IMAGE_API_KEY;
      if (!apiKey) {
        return {
          characterId,
          imageUrl: "https://placehold.co/600x400/png?text=Generated+Character",
        };
      }

      try {
        const res = await fetch("https://api.nanobanana.ai/v1/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ prompt: `Character design: ${input.prompt}` }),
        });

        if (!res.ok) throw new Error(`Image API error ${res.status}`);

        const data = await res.json();
        return { characterId, imageUrl: data.data[0].url };
      } catch (e) {
        return {
          characterId,
          imageUrl: "https://placehold.co/600x400/png?text=Character+Error",
        };
      }
    },
  },
};

export const dialogueBlock: BlockDefinition<any, any> = {
  id: "iem.reel.dialogue",
  name: "Dialogue",
  description: "Scripted character speech.",
  category: "media",
  input: z.object({ text: z.string(), characterId: z.string() }),
  output: z.object({ audioUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "tts",
    invoke: async () => ({ audioUrl: "http://audio.mp3" }),
  },
};

export const cameraBlock: BlockDefinition<any, any> = {
  id: "iem.reel.camera",
  name: "Camera",
  description: "Camera angles and movement.",
  category: "media",
  input: z.object({ angle: z.string(), movement: z.string() }),
  output: z.object({ settings: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "cam_op",
    invoke: async () => ({ settings: {} }),
  },
};

export const lightingBlock: BlockDefinition<any, any> = {
  id: "iem.reel.lighting",
  name: "Lighting",
  description: "Visual atmosphere and lights.",
  category: "media",
  input: z.object({ intensity: z.number(), color: z.string() }),
  output: z.object({ state: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "light_op",
    invoke: async () => ({ state: {} }),
  },
};

export const transitionBlock: BlockDefinition<any, any> = {
  id: "iem.reel.transition",
  name: "Transition",
  description: "Visual scene transitions.",
  category: "media",
  input: z.object({ type: z.string() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "trans_op",
    invoke: async () => ({ success: true }),
  },
};

export const vfxBlock: BlockDefinition<any, any> = {
  id: "iem.reel.vfx",
  name: "VFX",
  description: "Visual effect overlay.",
  category: "media",
  input: z.object({ effect: z.string() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vfx_op",
    invoke: async () => ({ success: true }),
  },
};

export const audioTrackBlock: BlockDefinition<any, any> = {
  id: "iem.reel.audioTrack",
  name: "Audio Track",
  description: "Background music or soundscape.",
  category: "media",
  input: z.object({ genre: z.string(), mood: z.string() }),
  output: z.object({ trackUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_audio",
    invoke: async () => ({ trackUrl: "http://bgm.mp3" }),
  },
};

export const textToImageBlock: BlockDefinition<any, any> = {
  id: "iem.reel.textToImage",
  name: "Text to Image",
  description: "Generate an image from text.",
  category: "media",
  input: z.object({ prompt: z.string() }),
  output: z.object({ imageUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_image",
    invoke: async (input: { prompt: string }) => {
      if (process.env.IEM_MOCK_MODELS === "1") {
        return { imageUrl: "https://placehold.co/600x400/png?text=Mock+Image" };
      }

      const geminiKey =
        process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (geminiKey) {
        const image = await generateGeminiImage(input.prompt, geminiKey);
        return { imageUrl: geminiImageToDataUrl(image) };
      }

      const legacyKey =
        process.env.NANOBANANA_API_KEY || process.env.IMAGE_API_KEY;
      if (!legacyKey) {
        throw new Error(
          "No GEMINI_API_KEY or image API key configured for text-to-image",
        );
      }

      const res = await fetch("https://api.nanobanana.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${legacyKey}`,
        },
        body: JSON.stringify({ prompt: input.prompt }),
      });

      if (!res.ok) throw new Error(`Image API error ${res.status}`);

      const data = await res.json();
      return { imageUrl: data.data[0].url };
    },
  },
};

export const textToSpeechBlock: BlockDefinition<any, any> = {
  id: "iem.reel.textToSpeech",
  name: "Text to Speech",
  description: "Generate audio from text.",
  category: "media",
  input: z.object({ text: z.string(), voiceId: z.string().optional() }),
  output: z.object({ audioUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_speech",
    invoke: async (input: any) => {
      if (process.env.IEM_MOCK_MODELS === "1") {
        return { audioUrl: "data:audio/mpeg;base64,mock_audio_data" };
      }

      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        // Fallback to placeholder if they only have Gemini keys (no speech API)
        return { audioUrl: "data:audio/mpeg;base64,mock_audio_data_generated" };
      }

      const voiceId = input.voiceId || "21m00Tcm4TlvDq8ikWAM"; // default voice
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
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
        },
      );

      if (!res.ok) throw new Error(`ElevenLabs API error ${res.status}`);

      const buffer = await res.arrayBuffer();
      let base64 = "dummy";
      if (typeof globalThis !== "undefined" && (globalThis as any).Buffer) {
        base64 = (globalThis as any).Buffer.from(buffer).toString("base64");
      } else if (typeof window !== "undefined") {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = window.btoa(binary);
      }
      return { audioUrl: `data:audio/mpeg;base64,${base64}` };
    },
  },
};
