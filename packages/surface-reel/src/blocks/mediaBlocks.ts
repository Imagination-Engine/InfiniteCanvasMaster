import { z } from 'zod';

export interface MCPToolBinding {
  kind: 'local' | 'remote';
  toolName: string;
  invoke: (input: any) => Promise<any>;
}

export interface BlockDefinition<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  view: any;
  agent: MCPToolBinding;
  mode: 'triggered' | 'streaming' | 'ambient';
}

const MockView = () => null;

export const textToImageBlock: BlockDefinition<any, any> = {
  id: 'iem.reel.textToImage',
  name: 'Text to Image',
  description: 'Generates an image from text using Nanobanana',
  category: 'media',
  input: z.object({
    prompt: z.string(),
    style: z.string().optional(),
  }),
  output: z.object({
    imageUrl: z.string().url(),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'generate_image',
    invoke: async (input) => {
      // Stub: in a real implementation, this interacts with Nanobanana API
      return { imageUrl: 'https://mock-image.url/image.png' };
    }
  }
};

export const textToSpeechBlock: BlockDefinition<any, any> = {
  id: 'iem.reel.textToSpeech',
  name: 'Text to Speech',
  description: 'Generates audio from text using ElevenLabs',
  category: 'media',
  input: z.object({
    text: z.string(),
    voiceId: z.string().optional(),
  }),
  output: z.object({
    audioUrl: z.string().url(),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'generate_audio',
    invoke: async (input) => {
      // Stub: in a real implementation, this interacts with ElevenLabs API
      return { audioUrl: 'https://mock-audio.url/audio.mp3' };
    }
  }
};