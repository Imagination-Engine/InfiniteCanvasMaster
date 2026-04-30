import { describe, it, expect } from 'vitest';
import { spawnerBlock } from './spawnerBlock';

describe('Spawner Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(spawnerBlock.id).toBe('iem.playable.spawner');
    expect(spawnerBlock.name).toBe('Spawner');
    
    const validIn = { payload: 'test' };
    expect(spawnerBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await spawnerBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => spawnerBlock.input.parse({ payload: 123 })).toThrow();
  });
});
