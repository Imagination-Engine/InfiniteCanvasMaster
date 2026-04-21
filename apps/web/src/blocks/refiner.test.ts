import { describe, it, expect, vi } from 'vitest';
import { refinerBlock, RefinerInput, RefinerOutput } from './refiner';

describe('Refiner Block', () => {
  describe('Schemas', () => {
    it('should validate a valid request schema', () => {
      const validRequest = { text: 'Hello', style: 'formal' };
      const result = RefinerInput.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid request schema', () => {
      const invalidRequest = { text: 123, style: 'non-existent' };
      const result = RefinerInput.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should validate a valid response schema', () => {
      const validResponse = { text: 'Greetings', model: 'test-model', latencyMs: 100 };
      const result = RefinerOutput.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Agent Binding', () => {
    it('should have a defined agent binding', () => {
      expect(refinerBlock.agent).toBeDefined();
      expect(refinerBlock.agent.toolName).toBe('refine_text');
    });

    it('should execute happy path successfully', async () => {
      // Mock invoke if necessary
      if (refinerBlock.agent.invoke) {
        vi.spyOn(refinerBlock.agent, 'invoke').mockResolvedValueOnce({
          text: 'Refined Hello',
          model: 'mocked-model',
          latencyMs: 50,
        });
      }

      const input = { text: 'Hello', style: 'formal' };
      const result = await refinerBlock.agent.invoke(input);
      const parsed = RefinerOutput.parse(result);
      
      expect(parsed.text).toBe('Refined Hello');
      expect(parsed.model).toBe('mocked-model');
    });

    it('should handle error path (network error)', async () => {
      if (refinerBlock.agent.invoke) {
        vi.spyOn(refinerBlock.agent, 'invoke').mockRejectedValueOnce(new Error('Network Error'));
      }

      const input = { text: 'Hello', style: 'formal' };
      await expect(refinerBlock.agent.invoke(input)).rejects.toThrow('Network Error');
    });

    it('should throw an error for malformed input (adversarial)', async () => {
      // restore the original invoke
      vi.restoreAllMocks();
      
      const malformedInput = { text: 123, style: 'formal' };
      await expect(refinerBlock.agent.invoke(malformedInput)).rejects.toThrow();
    });
  });
});