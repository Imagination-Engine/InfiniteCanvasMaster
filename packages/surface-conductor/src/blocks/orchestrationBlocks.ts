import { z } from 'zod';

// Minimal protocol for blocks (assuming a shared protocol will eventually be centralized)
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
  view: any;
  agent: MCPToolBinding;
  mode: 'triggered' | 'streaming' | 'ambient';
}

const MockView = () => null;

export const ifBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.if',
  name: 'If',
  description: 'Conditional routing branch',
  category: 'control',
  input: z.object({
    condition: z.string(),
    context: z.record(z.any()).default({}),
  }),
  output: z.object({
    branch: z.enum(['truePath', 'falsePath']),
    context: z.record(z.any()),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'evaluate_condition',
    invoke: async (input) => {
      // Very basic local evaluation stub; in reality this might be sandboxed or LLM-based
      const result = input.condition === 'true' || input.condition.includes('> 5');
      return { branch: result ? 'truePath' : 'falsePath', context: input.context };
    }
  }
};

export const forEachBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.foreach',
  name: 'For Each',
  description: 'Iterates over a collection',
  category: 'control',
  input: z.object({
    collection: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  output: z.object({
    items: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'pass_through_collection',
    invoke: async (input) => {
      return { items: input.collection, loopTarget: input.loopTarget };
    }
  }
};

export const webhookTriggerBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.webhook',
  name: 'Webhook Trigger',
  description: 'Starts workflow on webhook',
  category: 'trigger',
  input: z.object({
    path: z.string(),
  }),
  output: z.object({
    payload: z.record(z.any()),
  }),
  view: MockView,
  mode: 'ambient',
  agent: {
    kind: 'local',
    toolName: 'noop',
    invoke: async () => ({ payload: {} })
  }
};

export const scheduleTriggerBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.schedule',
  name: 'Schedule Trigger',
  description: 'Starts workflow on schedule',
  category: 'trigger',
  input: z.object({
    cron: z.string(),
  }),
  output: z.object({
    time: z.string(),
  }),
  view: MockView,
  mode: 'ambient',
  agent: {
    kind: 'local',
    toolName: 'noop',
    invoke: async () => ({ time: new Date().toISOString() })
  }
};