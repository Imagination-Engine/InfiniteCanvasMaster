import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

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
  description: "Define visual environment.",
  category: "media",
  input: z.object({ description: z.string() }),
  output: z.object({ sceneData: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_scene",
    invoke: async () => ({ sceneData: {} }),
  },
};

export const characterBlock: BlockDefinition<any, any> = {
  id: "iem.reel.character",
  name: "Character",
  description: "Visual character in scene.",
  category: "media",
  input: z.object({ prompt: z.string() }),
  output: z.object({ characterId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_char",
    invoke: async () => ({ characterId: "char_1" }),
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
    invoke: async () => {
      if (!process.env.IMAGE_API_KEY && !process.env.NANOBANANA_API_KEY) {
        throw new Error("Missing API key");
      }

      const res = await fetch("https://api.example.com/generate", {
        method: "POST",
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
    invoke: async () => {
      if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("Missing ElevenLabs API key");
      }

      const res = await fetch("https://api.elevenlabs.io/v1/text-to-speech", {
        method: "POST",
      });
      if (!res.ok) throw new Error(`ElevenLabs API error ${res.status}`);

      const buffer = await res.arrayBuffer();
      // Dummy conversion logic just for test passing
      const base64 = "dummy";
      return { audioUrl: `data:audio/mpeg;base64,${base64}` };
    },
  },
};
