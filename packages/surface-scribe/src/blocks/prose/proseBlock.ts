import { z } from 'zod';

export interface MCPToolBinding {
  kind: 'local' | 'remote';
  toolName: string;
  invoke: (input: any) => Promise<any>;
}

export interface BlockDefinition<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  agent: MCPToolBinding;
  mode: 'triggered' | 'streaming' | 'ambient';
}

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
