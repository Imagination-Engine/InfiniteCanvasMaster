import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmbedding } from '../lib/embeddings';

describe('Embedding Utility', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-api-key');
  });

  it('should generate an embedding for a given text', async () => {
    const mockEmbedding = new Array(768).fill(0.1);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        embedding: { values: mockEmbedding }
      })
    });

    const result = await generateEmbedding('test text');
    expect(result).toEqual(mockEmbedding);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.any(Object)
    );
  });

  it('should throw an error if the API call fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'test error' })
    });

    await expect(generateEmbedding('test text')).rejects.toThrow(/Failed to generate embedding/);
  });
});
