import { describe, it, expect } from 'vitest';
import { timelineBlock } from './timelineBlock';

describe('Timeline Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(timelineBlock.id).toBe('iem.reel.timeline');
    expect(timelineBlock.name).toBe('Timeline');
    
    const validIn = { payload: 'test' };
    expect(timelineBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await timelineBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => timelineBlock.input.parse({ payload: 123 })).toThrow();
  });
});
