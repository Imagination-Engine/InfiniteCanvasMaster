import { describe, it, expect } from 'vitest';
import { particleBlock } from './particleBlock';

describe('Particle Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(particleBlock.id).toBe('iem.playable.particle');
    expect(particleBlock.name).toBe('Particle');
    
    const validIn = { payload: 'test' };
    expect(particleBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await particleBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => particleBlock.input.parse({ payload: 123 })).toThrow();
  });
});
