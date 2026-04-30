import { describe, it, expect } from 'vitest';
import { vectorSearchBlock } from './vectorSearchBlock';

describe('VectorSearch Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(vectorSearchBlock.id).toBe('iem.atlas.vectorSearch');
    expect(vectorSearchBlock.name).toBe('VectorSearch');
    
    const validIn = { payload: 'test' };
    expect(vectorSearchBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await vectorSearchBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => vectorSearchBlock.input.parse({ payload: 123 })).toThrow();
  });
});
