import { z } from 'zod';

export const sceneBlock = {
  id: 'iem.reel.scene',
  name: 'Scene',
  description: 'Composes an image, dialogue, and duration on the timeline',
  category: 'media',
  input: z.object({
    imageUrl: z.string().url().optional(),
    dialogueUrl: z.string().url().optional(),
    durationMs: z.number().min(100).default(3000),
  }),
  output: z.object({
    sceneId: z.string(),
  }),
  agent: {
    kind: 'local',
    toolName: 'noop',
    invoke: async () => ({ sceneId: 'mock_scene_id' })
  }
};

export const cutBlock = {
  id: 'iem.reel.cut',
  name: 'Cut',
  description: 'A transition between two scenes',
  category: 'media',
  input: z.object({
    type: z.enum(['hard', 'fade', 'wipe']).default('hard'),
    durationMs: z.number().min(0).default(0),
  }),
  output: z.object({
    cutId: z.string(),
  }),
  agent: {
    kind: 'local',
    toolName: 'noop',
    invoke: async () => ({ cutId: 'mock_cut_id' })
  }
};