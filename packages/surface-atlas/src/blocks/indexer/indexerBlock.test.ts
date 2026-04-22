import { describe, it, expect } from 'vitest';
import { indexerBlock } from './indexerBlock';

describe('Indexer Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(indexerBlock.id).toBe('iem.atlas.indexer');
    expect(indexerBlock.name).toBe('Indexer');
    
    const validIn = { payload: 'test' };
    expect(indexerBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await indexerBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => indexerBlock.input.parse({ payload: 123 })).toThrow();
  });
});
