import { z } from 'zod';
import { ColliderView } from './ColliderView';
import type { BlockDefinition } from '@iem/core';

export const colliderInput = z.object({
  payload: z.string().optional()
});

export const colliderOutput = z.object({
  success: z.boolean()
});

export const colliderBlock: BlockDefinition<typeof colliderInput, typeof colliderOutput> = {
  id: 'iem.playable.collider',
  name: 'Collider',
  description: 'Auto-generated Collider block',
  category: 'uncategorized',
  input: colliderInput,
  output: colliderOutput,
  view: ColliderView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_collider',
    invoke: async (input) => {
      const parsed = colliderInput.parse(input);
      return { success: true };
    }
  }
};
