import { describe, it, expect } from 'vitest';
import { proofreaderBlock } from './proofreaderBlock';

describe('Proofreader Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(proofreaderBlock.id).toBe('iem.scribe.proofreader');
    expect(proofreaderBlock.name).toBe('Proofreader');
    
    const validIn = { payload: 'test' };
    expect(proofreaderBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await proofreaderBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => proofreaderBlock.input.parse({ payload: 123 })).toThrow();
  });
});
