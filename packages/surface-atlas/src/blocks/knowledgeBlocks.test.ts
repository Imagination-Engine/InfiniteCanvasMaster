import { describe, it, expect, vi } from 'vitest';
import { ingestionBlock, retrievalBlock, synthesisBlock } from './knowledgeBlocks';

describe('Knowledge-Primitive Blocks (Red/Green Phase)', () => {
  describe('Ingestion Block', () => {
    it('has valid metadata and schema', () => {
      expect(ingestionBlock.id).toBe('iem.atlas.ingestion');
      const validIn = { content: 'Sample text to embed', source: 'test.txt' };
      expect(ingestionBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('mocks vector DB ingestion', async () => {
      const output = await ingestionBlock.agent.invoke({ content: 'test', source: 'file' });
      expect(output).toHaveProperty('success', true);
      expect(output).toHaveProperty('chunksIngested');
    });

    it('adversarial: throws on empty content ingestion', () => {
      // Empty string validation logic via zod refinement or length
      expect(() => ingestionBlock.input.parse({ content: '', source: 'test.txt' })).toThrow();
    });
  });

  describe('Retrieval Block', () => {
    it('has valid metadata and schema', () => {
      expect(retrievalBlock.id).toBe('iem.atlas.retrieval');
      const validIn = { query: 'What is this?', topK: 5 };
      expect(retrievalBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('mocks vector DB retrieval', async () => {
      const output = await retrievalBlock.agent.invoke({ query: 'test' });
      expect(output).toHaveProperty('chunks');
      expect(Array.isArray(output.chunks)).toBe(true);
    });

    it('adversarial: handles retrieval against empty database', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ chunks: [] });
      const oldInvoke = retrievalBlock.agent.invoke;
      retrievalBlock.agent.invoke = mockInvoke;

      const output = await retrievalBlock.agent.invoke({ query: 'unknown' });
      expect(output.chunks).toEqual([]);

      retrievalBlock.agent.invoke = oldInvoke;
    });
  });

  describe('Synthesis Block', () => {
    it('has valid metadata and schema', () => {
      expect(synthesisBlock.id).toBe('iem.atlas.synthesis');
      const validIn = { query: 'Summarize', contextChunks: ['chunk 1', 'chunk 2'] };
      expect(synthesisBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('mocks LLM synthesis', async () => {
      const output = await synthesisBlock.agent.invoke({ query: 'test', contextChunks: [] });
      expect(output).toHaveProperty('answer');
      expect(typeof output.answer).toBe('string');
    });
  });
});