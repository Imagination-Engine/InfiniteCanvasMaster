import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const ProgrammerInput = z.object({
  prompt: z.string(),
  code: z.string().optional(),
});

export const ProgrammerOutput = z.object({
  generatedCode: z.string(),
});

export const programmerBlock: BlockDefinition<typeof ProgrammerInput, typeof ProgrammerOutput> = {
  id: 'iem.core.programmer',
  name: 'Programmer',
  description: 'Generate code.',
  category: 'code',
  input: ProgrammerInput,
  output: ProgrammerOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'generate_code',
    invoke: async (input: unknown) => {
      ProgrammerInput.parse(input);
      return { generatedCode: 'mock-code' };
    }
  }
};