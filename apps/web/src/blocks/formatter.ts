import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const FormatterInput = z.object({
  file: z.string(),
  desiredFormat: z.string(),
});

export const FormatterOutput = z.object({
  formattedFile: z.string(),
});

export const formatterBlock: BlockDefinition<typeof FormatterInput, typeof FormatterOutput> = {
  id: 'iem.core.formatter',
  name: 'Formatter',
  description: 'Format files.',
  category: 'data',
  input: FormatterInput,
  output: FormatterOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'format_file',
    invoke: async (input: unknown) => {
      FormatterInput.parse(input);
      return { formattedFile: 'mock-formatted-file' };
    }
  }
};