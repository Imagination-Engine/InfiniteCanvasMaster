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
  view: any;
  agent: MCPToolBinding;
  mode: 'triggered' | 'streaming' | 'ambient';
}

const MockView = () => null;

export const webFetchBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.webFetch',
  name: 'Web Fetch',
  description: 'Fetches content from a URL',
  category: 'web',
  input: z.object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST']).default('GET'),
    body: z.any().optional(),
  }),
  output: z.object({
    status: z.number(),
    data: z.any(),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'web_fetch',
    invoke: async (input) => {
      // In a real implementation, this uses node-fetch or similar
      return { status: 200, data: 'mock_data' };
    }
  }
};

export const slackPostBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.slackPost',
  name: 'Slack Post',
  description: 'Posts a message to Slack',
  category: 'productivity',
  input: z.object({
    channel: z.string(),
    message: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    messageId: z.string().optional(),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'slack_post',
    invoke: async (input) => {
      // Real implementation would handle OAuth tokens and Slack API calls
      return { success: true, messageId: 'msg_123' };
    }
  }
};

export const notionCreateBlock: BlockDefinition<any, any> = {
  id: 'iem.conductor.notionCreate',
  name: 'Notion Create Card',
  description: 'Creates a card in a Notion Database',
  category: 'productivity',
  input: z.object({
    databaseId: z.string(),
    properties: z.record(z.any()),
  }),
  output: z.object({
    success: z.boolean(),
    pageId: z.string().optional(),
  }),
  view: MockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'notion_create',
    invoke: async (input) => {
      // Real implementation would handle OAuth tokens and Notion API calls
      return { success: true, pageId: 'page_456' };
    }
  }
};