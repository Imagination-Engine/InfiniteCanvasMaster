import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasMCPServer } from './mcp-server';
import { blockRegistry } from '../block/registry';
import { z } from 'zod';

// Minimal mock block to register
const MockInput = z.object({ value: z.string() });
const MockOutput = z.object({ result: z.string() });

const mockBlock = {
  id: 'mock.block',
  name: 'Mock Block',
  description: 'A block for testing',
  category: 'test',
  input: MockInput,
  output: MockOutput,
  view: () => null,
  mode: 'triggered' as const,
  agent: {
    kind: 'local' as const,
    toolName: 'mock_tool',
    invoke: async (input: any) => ({ result: `mocked ${input.value}` }),
  },
};

describe('Canvas MCP Server', () => {
  let server: CanvasMCPServer;

  beforeEach(() => {
    // Clear and re-register
    try {
      blockRegistry.register(mockBlock);
    } catch(e) {} // ignore if already registered
    server = new CanvasMCPServer();
  });

  it('should expose canvas manipulation tools', () => {
    const tools = server.getTools();
    const toolNames = tools.map(t => t.name);
    expect(toolNames).toContain('canvas.describe');
    expect(toolNames).toContain('canvas.addBlock');
    expect(toolNames).toContain('canvas.connect');
    expect(toolNames).toContain('canvas.run');
    expect(toolNames).toContain('canvas.listBlocks');
  });

  it('should automatically expose registered blocks as tools', () => {
    const tools = server.getTools();
    const toolNames = tools.map(t => t.name);
    // Prefix registered blocks with canvas.block.
    expect(toolNames).toContain('canvas.block.mock.block');
  });

  it('should allow adding a block and describing the canvas', async () => {
    await server.executeTool('canvas.addBlock', { blockId: 'mock.block', position: { x: 0, y: 0 } });
    const description = await server.executeTool('canvas.describe', {});
    expect(description).toBeDefined();
    expect(JSON.stringify(description)).toContain('mock.block');
  });

  it('should wire blocks and execute them successfully (adversarial integration)', async () => {
    // 1. Add blocks
    const b1 = await server.executeTool('canvas.addBlock', { blockId: 'mock.block', position: { x: 0, y: 0 }, params: { value: 'test1' } });
    const b2 = await server.executeTool('canvas.addBlock', { blockId: 'mock.block', position: { x: 100, y: 0 }, params: { value: 'test2' } });
    
    // 2. Connect blocks (Output of b1 to input of b2)
    // Note: We're mocking the internal logic so we just check if it throws
    await server.executeTool('canvas.connect', { fromNodeId: b1.nodeId, fromPort: 'result', toNodeId: b2.nodeId, toPort: 'value' });

    // 3. Execute
    const executionResult = await server.executeTool('canvas.run', {});
    expect(executionResult.status).toBe('success');
  });
});