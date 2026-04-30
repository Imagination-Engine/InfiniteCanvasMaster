import { describe, it, expect } from 'vitest';
import { audioBlock } from './audioBlock';

describe('Audio Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(audioBlock.id).toBe('iem.playable.audio');
    expect(audioBlock.name).toBe('Audio');
    
    const validIn = { payload: 'test' };
    expect(audioBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await audioBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => audioBlock.input.parse({ payload: 123 })).toThrow();
  });
});
