import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCustomAgentComplete } from './customAgentClient';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the block registry
vi.mock('../../block/registry', () => ({
  blockRegistry: {
    register: vi.fn(),
  }
}));

describe('handleCustomAgentComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send payload to API and register the block', async () => {
    const payload = {
      story: 'Story',
      persona: { name: 'Bot', tagline: '', tone: 'concise' },
      skills: [],
      capabilities: { executionMode: 'triggered', outputTypes: [] },
      purpose: ''
    };

    const blockDef = { id: 'test-id', name: 'Bot' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id', blockDefinition: blockDef })
    });

    const result = await handleCustomAgentComplete(payload);

    expect(mockFetch).toHaveBeenCalledWith('/api/custom-agents', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload)
    }));

    const { blockRegistry } = await import('../../block/registry');
    expect(blockRegistry.register).toHaveBeenCalledWith(blockDef);
    expect(result).toEqual(blockDef);
  });

  it('should throw an error if API call fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request'
    });

    await expect(handleCustomAgentComplete({} as any)).rejects.toThrow(/Failed to save custom agent/);
  });
});
