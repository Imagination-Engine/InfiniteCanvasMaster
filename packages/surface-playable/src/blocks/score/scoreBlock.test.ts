import { describe, it, expect } from 'vitest';
import { scoreBlock } from './scoreBlock';

describe('Score Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(scoreBlock.id).toBe('iem.playable.score');
    expect(scoreBlock.name).toBe('Score');
    
    const validIn = { payload: 'test' };
    expect(scoreBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await scoreBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => scoreBlock.input.parse({ payload: 123 })).toThrow();
  });
});
