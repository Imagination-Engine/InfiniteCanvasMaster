import { describe, it, expect } from 'vitest';
import { chapterBlock } from './chapterBlock';

describe('Chapter Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(chapterBlock.id).toBe('iem.scribe.chapter');
    expect(chapterBlock.name).toBe('Chapter');
    
    const validIn = { payload: 'test' };
    expect(chapterBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await chapterBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => chapterBlock.input.parse({ payload: 123 })).toThrow();
  });
});
