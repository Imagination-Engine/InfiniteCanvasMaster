import { describe, it, expect } from 'vitest';
import { colliderBlock } from './colliderBlock';

describe('Collider Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(colliderBlock.id).toBe('iem.playable.collider');
    expect(colliderBlock.name).toBe('Collider');
    
    const validIn = { payload: 'test' };
    expect(colliderBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await colliderBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => colliderBlock.input.parse({ payload: 123 })).toThrow();
  });
});
