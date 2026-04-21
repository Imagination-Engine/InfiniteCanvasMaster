import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const FilterInput = z.object({
  source: z.string(),
  conditions: z.string(),
});

export const FilterOutput = z.object({
  filtered: z.string(),
});

export const filterBlock: BlockDefinition<typeof FilterInput, typeof FilterOutput> = {
  id: 'iem.core.filter',
  name: 'Filter',
  description: 'Filter based on conditions.',
  category: 'data',
  input: FilterInput,
  output: FilterOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'filter_data',
    invoke: async (input: unknown) => {
      FilterInput.parse(input);
      return { filtered: 'mock-filtered-data' };
    }
  }
};