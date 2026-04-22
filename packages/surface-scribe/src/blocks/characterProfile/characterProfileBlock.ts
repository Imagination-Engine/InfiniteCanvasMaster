import { z } from 'zod';
import { CharacterProfileView } from './CharacterProfileView';
import type { BlockDefinition } from '@iem/core';

export const characterProfileInput = z.object({
  payload: z.string().optional()
});

export const characterProfileOutput = z.object({
  success: z.boolean()
});

export const characterProfileBlock: BlockDefinition<typeof characterProfileInput, typeof characterProfileOutput> = {
  id: 'iem.scribe.characterProfile',
  name: 'CharacterProfile',
  description: 'Auto-generated CharacterProfile block',
  category: 'uncategorized',
  input: characterProfileInput,
  output: characterProfileOutput,
  view: CharacterProfileView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_characterProfile',
    invoke: async (input) => {
      const parsed = characterProfileInput.parse(input);
      return { success: true };
    }
  }
};
