import { describe, it, expect, vi } from 'vitest';
import { GeminiProvider, type ChatRequest } from './provider';

describe('GeminiProvider', () => {
  it('should implement the ModelProvider interface', () => {
    const provider = new GeminiProvider('test-api-key');
    expect(provider.id).toBe('gemini');
    expect(provider.name).toBe('Google Gemini');
    expect(provider.supportsTools).toBe(true);
    expect(typeof provider.chat).toBe('function');
    expect(typeof provider.stream).toBe('function');
  });

  it('should handle a happy path chat request', async () => {
    const provider = new GeminiProvider('test-api-key');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Mocked Gemini Response' }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 }
      })
    });

    const request: ChatRequest = {
      model: 'gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Hello' }]
    };

    const response = await provider.chat(request);
    expect(response.content).toBe('Mocked Gemini Response');
    expect(response.usage.inputTokens).toBe(10);
    expect(response.usage.outputTokens).toBe(20);
  });

  it('should handle rate limits and timeouts (adversarial)', async () => {
    const provider = new GeminiProvider('test-api-key');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });

    const request: ChatRequest = {
      model: 'gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Hello' }]
    };

    await expect(provider.chat(request)).rejects.toThrow(/Rate limit exceeded/i);
    
    // Test timeout
    global.fetch = vi.fn().mockRejectedValue(new Error('Timeout'));
    await expect(provider.chat(request)).rejects.toThrow(/Timeout/i);
  });
});
