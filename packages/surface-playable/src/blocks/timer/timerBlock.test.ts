import { describe, it, expect } from 'vitest';
import { timerBlock } from './timerBlock';

describe('Timer Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(timerBlock.id).toBe('iem.playable.timer');
    expect(timerBlock.name).toBe('Timer');
    
    const validIn = { payload: 'test' };
    expect(timerBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await timerBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => timerBlock.input.parse({ payload: 123 })).toThrow();
  });
});
