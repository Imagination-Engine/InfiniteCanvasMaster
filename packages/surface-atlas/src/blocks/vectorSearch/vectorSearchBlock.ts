import { z } from 'zod';
import { VectorSearchView } from './VectorSearchView';
import type { BlockDefinition } from '@iem/core';

export const vectorSearchInput = z.object({
  payload: z.string().optional()
});

export const vectorSearchOutput = z.object({
  success: z.boolean()
});

export const vectorSearchBlock: BlockDefinition<typeof vectorSearchInput, typeof vectorSearchOutput> = {
  id: 'iem.atlas.vectorSearch',
  name: 'VectorSearch',
  description: 'Auto-generated VectorSearch block',
  category: 'uncategorized',
  input: vectorSearchInput,
  output: vectorSearchOutput,
  view: VectorSearchView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_vectorSearch',
    invoke: async (input) => {
      const parsed = vectorSearchInput.parse(input);
      return { success: true };
    }
  }
};
