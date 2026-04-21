import { describe, it, expect, vi } from 'vitest';
import { GoogleWorkspaceServer } from './index';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

describe('Google Workspace MCP Server (Red/Green Phase)', () => {
  it('registers expected tools during initialization', () => {
    const mockMcpServer = {
      setRequestHandler: vi.fn(),
    } as unknown as Server;

    const server = new GoogleWorkspaceServer(mockMcpServer, { mockClient: true });
    
    // We just check that the server instantiated without throwing
    expect(server).toBeDefined();
    expect(mockMcpServer.setRequestHandler).toHaveBeenCalledTimes(2); // CallToolRequest and ListToolsRequest
  });

  describe('Gmail Tools', () => {
    it('executes gmail_read returning mocked emails', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockClient: true });
      const result = await server.handleCallTool('gmail_read', { query: 'in:inbox' });
      expect(result.content[0].text).toContain('Mock Email Body');
    });

    it('executes gmail_send successfully', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockClient: true });
      const result = await server.handleCallTool('gmail_send', { to: 'test@test.com', subject: 'hello', body: 'world' });
      expect(result.content[0].text).toBe('Email sent successfully to test@test.com');
    });
  });

  describe('Calendar Tools', () => {
    it('executes calendar_read returning mocked events', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockClient: true });
      const result = await server.handleCallTool('calendar_read', { timeMin: '2026-01-01', timeMax: '2026-01-31' });
      expect(result.content[0].text).toContain('Mock Event');
    });

    it('executes calendar_create successfully', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockClient: true });
      const result = await server.handleCallTool('calendar_create', { title: 'Meeting', startTime: '10:00', endTime: '11:00' });
      expect(result.content[0].text).toBe('Event Meeting created successfully');
    });
  });

  describe('Adversarial Scenarios', () => {
    it('adversarial: handles invalid OAuth tokens gracefully simulating a 401', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockAuthFailure: true });
      await expect(server.handleCallTool('gmail_read', { query: 'in:inbox' })).rejects.toThrow('Authentication failed (401)');
    });

    it('adversarial: handles API rate limits simulating a 429', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockRateLimit: true });
      await expect(server.handleCallTool('gmail_read', { query: 'in:inbox' })).rejects.toThrow('Rate limit exceeded (429)');
    });

    it('adversarial: rejects invalid tool arguments via zod schema', async () => {
      const server = new GoogleWorkspaceServer(new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } }), { mockClient: true });
      await expect(server.handleCallTool('gmail_send', { to: 'invalid-email' })).rejects.toThrow(); // zod validation fail on email format
    });
  });
});