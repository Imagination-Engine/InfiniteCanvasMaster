import { z } from 'zod';
import { IndexerView } from './IndexerView';
import type { BlockDefinition } from '@iem/core';

export const indexerInput = z.object({
  payload: z.string().optional()
});

export const indexerOutput = z.object({
  success: z.boolean()
});

export const indexerBlock: BlockDefinition<typeof indexerInput, typeof indexerOutput> = {
  id: 'iem.atlas.indexer',
  name: 'Indexer',
  description: 'Auto-generated Indexer block',
  category: 'uncategorized',
  input: indexerInput,
  output: indexerOutput,
  view: IndexerView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_indexer',
    invoke: async (input) => {
      const parsed = indexerInput.parse(input);
      return { success: true };
    }
  }
};
