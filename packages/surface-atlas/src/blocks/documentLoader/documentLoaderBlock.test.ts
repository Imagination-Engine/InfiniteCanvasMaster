import { describe, it, expect } from 'vitest';
import { documentLoaderBlock } from './documentLoaderBlock';

describe('DocumentLoader Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(documentLoaderBlock.id).toBe('iem.atlas.documentLoader');
    expect(documentLoaderBlock.name).toBe('DocumentLoader');
    
    const validIn = { payload: 'test' };
    expect(documentLoaderBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await documentLoaderBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => documentLoaderBlock.input.parse({ payload: 123 })).toThrow();
  });
});
