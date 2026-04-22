import { describe, it, expect } from 'vitest';
import { characterProfileBlock } from './characterProfileBlock';

describe('CharacterProfile Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(characterProfileBlock.id).toBe('iem.scribe.characterProfile');
    expect(characterProfileBlock.name).toBe('CharacterProfile');
    
    const validIn = { payload: 'test' };
    expect(characterProfileBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await characterProfileBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => characterProfileBlock.input.parse({ payload: 123 })).toThrow();
  });
});
