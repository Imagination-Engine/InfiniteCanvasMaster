import { describe, it, expect } from 'vitest';
import { dialogueTreeBlock } from './dialogueTreeBlock';

describe('DialogueTree Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(dialogueTreeBlock.id).toBe('iem.scribe.dialogueTree');
    expect(dialogueTreeBlock.name).toBe('DialogueTree');
    
    const validIn = { payload: 'test' };
    expect(dialogueTreeBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await dialogueTreeBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => dialogueTreeBlock.input.parse({ payload: 123 })).toThrow();
  });
});
