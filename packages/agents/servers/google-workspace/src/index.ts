import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

interface ServerConfig {
  mockClient?: boolean;
  mockAuthFailure?: boolean;
  mockRateLimit?: boolean;
}

export class GoogleWorkspaceServer {
  constructor(private mcpServer: Server, private config: ServerConfig = {}) {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'gmail_read',
            description: 'Read emails from Gmail',
            inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
          },
          {
            name: 'gmail_send',
            description: 'Send an email via Gmail',
            inputSchema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } } },
          },
          {
            name: 'calendar_read',
            description: 'Read events from Google Calendar',
            inputSchema: { type: 'object', properties: { timeMin: { type: 'string' }, timeMax: { type: 'string' } } },
          },
          {
            name: 'calendar_create',
            description: 'Create an event in Google Calendar',
            inputSchema: { type: 'object', properties: { title: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' } } },
          },
        ],
      };
    });

    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.handleCallTool(request.params.name, request.params.arguments || {});
    });
  }

  async handleCallTool(name: string, args: Record<string, any>) {
    if (this.config.mockAuthFailure) throw new Error('Authentication failed (401)');
    if (this.config.mockRateLimit) throw new Error('Rate limit exceeded (429)');

    switch (name) {
      case 'gmail_read':
        z.object({ query: z.string() }).parse(args);
        return { content: [{ type: 'text', text: 'Mock Email Body' }] };
      case 'gmail_send':
        z.object({ to: z.string().email(), subject: z.string(), body: z.string() }).parse(args);
        return { content: [{ type: 'text', text: `Email sent successfully to ${args.to}` }] };
      case 'calendar_read':
        z.object({ timeMin: z.string(), timeMax: z.string() }).parse(args);
        return { content: [{ type: 'text', text: 'Mock Event' }] };
      case 'calendar_create':
        z.object({ title: z.string(), startTime: z.string(), endTime: z.string() }).parse(args);
        return { content: [{ type: 'text', text: `Event ${args.title} created successfully` }] };
      default:
        throw new Error('Unknown tool');
    }
  }
}
