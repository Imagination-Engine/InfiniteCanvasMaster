// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";
import { generateGeminiImage, geminiImageToDataUrl } from "@iem/core";

export const timelineBlock: BlockDefinition<any, any> = {
  id: "iem.reel.timeline",
  name: "Reel Timeline",
  description: "Sequencing and timing control.",
  category: "media",
  input: z.object({ sequence: z.array(z.string()) }),
  output: z.object({ duration: z.number() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "seq_events",
    invoke: async () => ({ duration: 30 }),
  },
};

export const exportBlock: BlockDefinition<any, any> = {
  id: "iem.reel.export",
  name: "Reel Export",
  description: "Final render settings and export.",
  category: "media",
  input: z.object({
    format: z.enum(["mp4", "gif", "mov"]),
    quality: z.string(),
  }),
  output: z.object({ exportUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "render_video",
    invoke: async () => ({ exportUrl: "http://export.mp4" }),
  },
};

export const sceneBlock: BlockDefinition<any, any> = {
  id: "iem.reel.scene",
  name: "Scene",
  description: "A single narrative scene or beat.",
  category: "media",
  input: z.object({ description: z.string(), duration: z.number().optional() }),
  output: z.object({ sceneId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "def_scene",
    invoke: async () => ({ sceneId: "scene-1" }),
  },
};

export const characterBlock: BlockDefinition<any, any> = {
  id: "iem.reel.character",
  name: "Character",
  description: "Character visual and trait definition.",
  category: "media",
  input: z.object({ name: z.string(), traits: z.array(z.string()) }),
  output: z.object({ characterId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "def_char",
    invoke: async () => ({ characterId: "char-1" }),
  },
};

export const dialogueBlock: BlockDefinition<any, any> = {
  id: "iem.reel.dialogue",
  name: "Dialogue",
  description: "Scripted lines for characters.",
  category: "media",
  input: z.object({ characterId: z.string(), line: z.string() }),
  output: z.object({ scriptId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "def_dialogue",
    invoke: async () => ({ scriptId: "dialogue-1" }),
  },
};

export const cameraBlock: BlockDefinition<any, any> = {
  id: "iem.reel.camera",
  name: "Camera",
  description: "Shot type and movement control.",
  category: "media",
  input: z.object({ shotType: z.string(), movement: z.string() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "camera_op",
    invoke: async () => ({ success: true }),
  },
};

export const lightingBlock: BlockDefinition<any, any> = {
  id: "iem.reel.lighting",
  name: "Lighting",
  description: "Atmospheric lighting setup.",
  category: "media",
  input: z.object({ style: z.string(), intensity: z.number() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "light_op",
    invoke: async () => ({ success: true }),
  },
};

export const transitionBlock: BlockDefinition<any, any> = {
  id: "iem.reel.transition",
  name: "Transition",
  description: "Scene transition effects.",
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
  input: z.object({
    prompt: z.string().optional(),
    description: z.string().optional(),
    _instructions: z.string().optional(),
  }),
  output: z.object({ imageUrl: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_image",
    invoke: async (input: any) => {
      const prompt = (
        input.prompt ||
        input.description ||
        input._instructions ||
        ""
      ).trim();

      if (!prompt) {
        throw new Error(
          "No prompt or description provided for image generation",
        );
      }

      if (process.env.IEM_MOCK_MODELS === "1") {
        return {
          imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(prompt.substring(0, 20))}`,
        };
      }

      const geminiKey =
        process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (geminiKey) {
        const image = await generateGeminiImage(prompt, geminiKey);
        return { imageUrl: geminiImageToDataUrl(image) };
      }

      throw new Error("No GEMINI_API_KEY configured for text-to-image");
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
        return { audioUrl: "data:audio/mpeg;base64,mock_audio_data_generated" };
      }

      const voiceId = input.voiceId || "21m00Tcm4TlvDq8ikWAM";
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

export const videoStudioBlock: BlockDefinition<any, any> = {
  id: "iem.studio.video",
  name: "Video Studio",
  description: "Forges footage from reference images using Google Veo.",
  category: "media",
  input: z.object({
    prompt: z.string().optional(),
    description: z.string().optional(),
    _instructions: z.string().optional(),
    referenceImages: z.array(z.object({ url: z.string() })).optional(),
  }),
  output: z.object({
    clipUrl: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "video_forge",
    invoke: async (input: any) => {
      const prompt = (
        input.prompt ||
        input.description ||
        input._instructions ||
        "Cinematic sequence"
      ).trim();
      const { referenceImages = [] } = input;

      const baseUrl = process.env.API_BASE_URL || "http://localhost:3001";

      try {
        const startRes = await fetch(`${baseUrl}/api/reel/generate-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, referenceImages }),
        });

        if (!startRes.ok) {
          const err = await startRes.json().catch(() => ({}));
          throw new Error(
            err.error || `Failed to start video job: ${startRes.status}`,
          );
        }

        const { operationId } = await startRes.json();

        const maxAttempts = 60;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((r) => setTimeout(r, 5000));

          const pollRes = await fetch(
            `${baseUrl}/api/reel/generate-video/${operationId}`,
          );
          if (!pollRes.ok) continue;

          const job = await pollRes.json();
          if (job.status === "done" && job.clipUrl) {
            return { clipUrl: job.clipUrl };
          }
          if (job.status === "error") {
            throw new Error(job.error || "Video generation failed");
          }
        }

        throw new Error("Video generation timed out");
      } catch (err: any) {
        console.error("[VideoStudioBlock] Execution failed:", err);
        throw err;
      }
    },
  },
};
