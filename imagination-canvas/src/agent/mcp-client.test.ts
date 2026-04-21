import { describe, it, expect, vi } from 'vitest';
import { dispatchMCPTool } from './mcp-client';
import type { MCPToolBinding } from './mcp-binding';

describe('MCP Client Integration', () => {
  it('should dispatch local tool successfully', async () => {
    const binding: MCPToolBinding = {
      kind: 'local',
      toolName: 'test_tool',
      invoke: vi.fn().mockResolvedValue('local success'),
    };
    
    const result = await dispatchMCPTool(binding, { arg: 1 });
    expect(result).toBe('local success');
    expect(binding.invoke).toHaveBeenCalledWith({ arg: 1 });
  });

  it('should handle remote tool dispatch (mocked SDK call)', async () => {
    const binding: MCPToolBinding = {
      kind: 'remote',
      toolName: 'remote_tool',
      serverUrl: 'http://localhost:8080/mcp',
      invoke: vi.fn(), // Shouldn't be called directly for remote in real impl
    };
    
    // We will mock the internal client later, for now we expect it to return a mocked string
    const result = await dispatchMCPTool(binding, { arg: 2 });
    expect(result).toBe('remote success');
  });

  it('should handle broken remote connection (adversarial)', async () => {
    const binding: MCPToolBinding = {
      kind: 'remote',
      toolName: 'broken_tool',
      serverUrl: 'http://invalid-url:9999/mcp',
      invoke: vi.fn(),
    };
    
    await expect(dispatchMCPTool(binding, {})).rejects.toThrow(/Connection failed/);
  });
});