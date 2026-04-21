import { describe, it, expect } from 'vitest';
import { getGeminiProvider } from './geminiProvider';

describe('Gemini 3.5 Pro Integration', () => {
  it('returns the correct model identifier', () => {
    const provider = getGeminiProvider();
    expect(provider.modelName).toBe('gemini-3.5-pro');
  });

  it('can format prompts for the Builder agent', () => {
    const provider = getGeminiProvider();
    const prompt = provider.formatBuilderPrompt({ spec: 'foo', design: 'bar' });
    expect(prompt).toContain('spec: foo');
    expect(prompt).toContain('design: bar');
  });
});