import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const GmailInput = z.object({
  action: z.enum(['send', 'retrieve']),
  payload: z.any().optional(),
});

export const GmailOutput = z.object({
  result: z.any(),
});

export const gmailBlock: BlockDefinition<typeof GmailInput, typeof GmailOutput> = {
  id: 'iem.core.gmail',
  name: 'Gmail',
  description: 'Send or retrieve emails.',
  category: 'io',
  input: GmailInput,
  output: GmailOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'gmail_action',
    invoke: async (input: unknown) => {
      GmailInput.parse(input);
      return { result: 'mock-gmail-result' };
    }
  }
};