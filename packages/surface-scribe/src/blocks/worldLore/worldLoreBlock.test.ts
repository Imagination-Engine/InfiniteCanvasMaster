import { describe, it, expect } from 'vitest';
import { worldLoreBlock } from './worldLoreBlock';

describe('WorldLore Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(worldLoreBlock.id).toBe('iem.scribe.worldLore');
    expect(worldLoreBlock.name).toBe('WorldLore');
    
    const validIn = { payload: 'test' };
    expect(worldLoreBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await worldLoreBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => worldLoreBlock.input.parse({ payload: 123 })).toThrow();
  });
});
