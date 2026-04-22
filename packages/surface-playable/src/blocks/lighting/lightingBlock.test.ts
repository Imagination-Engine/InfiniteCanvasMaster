import { describe, it, expect } from 'vitest';
import { lightingBlock } from './lightingBlock';

describe('Lighting Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(lightingBlock.id).toBe('iem.playable.lighting');
    expect(lightingBlock.name).toBe('Lighting');
    
    const validIn = { payload: 'test' };
    expect(lightingBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await lightingBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => lightingBlock.input.parse({ payload: 123 })).toThrow();
  });
});
