import { z } from 'zod';
import { WorldLoreView } from './WorldLoreView';
import type { BlockDefinition } from '@iem/core';

export const worldLoreInput = z.object({
  payload: z.string().optional()
});

export const worldLoreOutput = z.object({
  success: z.boolean()
});

export const worldLoreBlock: BlockDefinition<typeof worldLoreInput, typeof worldLoreOutput> = {
  id: 'iem.scribe.worldLore',
  name: 'WorldLore',
  description: 'Auto-generated WorldLore block',
  category: 'uncategorized',
  input: worldLoreInput,
  output: worldLoreOutput,
  view: WorldLoreView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_worldLore',
    invoke: async (input) => {
      const parsed = worldLoreInput.parse(input);
      return { success: true };
    }
  }
};
