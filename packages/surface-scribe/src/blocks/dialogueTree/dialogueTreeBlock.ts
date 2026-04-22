import { z } from 'zod';
import { DialogueTreeView } from './DialogueTreeView';
import type { BlockDefinition } from '@iem/core';

export const dialogueTreeInput = z.object({
  payload: z.string().optional()
});

export const dialogueTreeOutput = z.object({
  success: z.boolean()
});

export const dialogueTreeBlock: BlockDefinition<typeof dialogueTreeInput, typeof dialogueTreeOutput> = {
  id: 'iem.scribe.dialogueTree',
  name: 'DialogueTree',
  description: 'Auto-generated DialogueTree block',
  category: 'uncategorized',
  input: dialogueTreeInput,
  output: dialogueTreeOutput,
  view: DialogueTreeView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_dialogueTree',
    invoke: async (input) => {
      const parsed = dialogueTreeInput.parse(input);
      return { success: true };
    }
  }
};
