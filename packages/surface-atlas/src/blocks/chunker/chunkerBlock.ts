import { z } from 'zod';
import { TextChunkerView } from './TextChunkerView';
import type { BlockDefinition } from '@iem/core';

export const chunkerInput = z.object({
  payload: z.string().optional()
});

export const chunkerOutput = z.object({
  success: z.boolean()
});

export const chunkerBlock: BlockDefinition<typeof chunkerInput, typeof chunkerOutput> = {
  id: 'iem.atlas.chunker',
  name: 'TextChunker',
  description: 'Auto-generated TextChunker block',
  category: 'uncategorized',
  input: chunkerInput,
  output: chunkerOutput,
  view: TextChunkerView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_chunker',
    invoke: async (input) => {
      const parsed = chunkerInput.parse(input);
      return { success: true };
    }
  }
};
