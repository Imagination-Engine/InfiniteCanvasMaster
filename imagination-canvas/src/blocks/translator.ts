import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const TranslatorInput = z.object({
  text: z.string(),
  targetLanguage: z.string(),
});

export const TranslatorOutput = z.object({
  result: z.string(),
});

export const translatorBlock: BlockDefinition<typeof TranslatorInput, typeof TranslatorOutput> = {
  id: 'iem.core.translator',
  name: 'Translator',
  description: 'Translate text.',
  category: 'text',
  input: TranslatorInput,
  output: TranslatorOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'translate',
    invoke: async (input: unknown) => {
      TranslatorInput.parse(input);
      return { result: 'Mock Translation' };
    }
  }
};