import { z } from 'zod';
import { ProofreaderView } from './ProofreaderView';
import type { BlockDefinition } from '@iem/core';

export const proofreaderInput = z.object({
  payload: z.string().optional()
});

export const proofreaderOutput = z.object({
  success: z.boolean()
});

export const proofreaderBlock: BlockDefinition<typeof proofreaderInput, typeof proofreaderOutput> = {
  id: 'iem.scribe.proofreader',
  name: 'Proofreader',
  description: 'Auto-generated Proofreader block',
  category: 'uncategorized',
  input: proofreaderInput,
  output: proofreaderOutput,
  view: ProofreaderView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_proofreader',
    invoke: async (input) => {
      const parsed = proofreaderInput.parse(input);
      return { success: true };
    }
  }
};
