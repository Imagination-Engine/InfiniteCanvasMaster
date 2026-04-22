import { z } from 'zod';
import { BlockDefinition, MCPToolBinding } from '@iem/core';



export const proseBlock: BlockDefinition<any, any> = {
  id: 'iem.scribe.prose',
  name: 'Prose',
  description: 'Auto-generated Prose block',
  category: 'uncategorized',
  input: z.object({
    payload: z.string().optional()
  }),
  output: z.object({
    success: z.boolean()
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_prose',
    invoke: async (input) => {
      return { success: true };
    }
  }
};
