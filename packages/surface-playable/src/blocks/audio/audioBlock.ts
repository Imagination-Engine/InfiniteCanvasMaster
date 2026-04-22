import { z } from 'zod';
import { AudioView } from './AudioView';
import type { BlockDefinition } from '@iem/core';

export const audioInput = z.object({
  payload: z.string().optional()
});

export const audioOutput = z.object({
  success: z.boolean()
});

export const audioBlock: BlockDefinition<typeof audioInput, typeof audioOutput> = {
  id: 'iem.playable.audio',
  name: 'Audio',
  description: 'Auto-generated Audio block',
  category: 'uncategorized',
  input: audioInput,
  output: audioOutput,
  view: AudioView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_audio',
    invoke: async (input) => {
      const parsed = audioInput.parse(input);
      return { success: true };
    }
  }
};
