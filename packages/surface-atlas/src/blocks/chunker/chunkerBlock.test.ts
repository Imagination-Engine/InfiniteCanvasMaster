import { describe, it, expect } from 'vitest';
import { chunkerBlock } from './chunkerBlock';

describe('TextChunker Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(chunkerBlock.id).toBe('iem.atlas.chunker');
    expect(chunkerBlock.name).toBe('TextChunker');
    
    const validIn = { payload: 'test' };
    expect(chunkerBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await chunkerBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => chunkerBlock.input.parse({ payload: 123 })).toThrow();
  });
});
