import { describe, it, expect } from 'vitest';
import { proseBlock } from './proseBlock';

describe('Prose Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(proseBlock.id).toBe('iem.scribe.prose');
    expect(proseBlock.name).toBe('Prose');
    
    const validIn = { payload: 'test' };
    expect(proseBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await proseBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => proseBlock.input.parse({ payload: 123 })).toThrow();
  });
});
