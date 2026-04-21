import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const SummarizerInput = z.object({
  text: z.string().optional(),
});

export const SummarizerOutput = z.object({
  summary: z.string(),
});

export const summarizerBlock: BlockDefinition<typeof SummarizerInput, typeof SummarizerOutput> = {
  id: 'iem.core.summarizer',
  name: 'Summarizer',
  description: 'Summarize text inputs.',
  category: 'text',
  input: SummarizerInput,
  output: SummarizerOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'summarize',
    invoke: async (input: unknown) => {
      SummarizerInput.parse(input);
      return { summary: 'Mock Summary' };
    }
  }
};