import { describe, it, expect } from 'vitest';
import { editorBlock } from './editorBlock';

describe('Editor Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(editorBlock.id).toBe('iem.scribe.editor');
    expect(editorBlock.name).toBe('Editor');
    
    const validIn = { payload: 'test' };
    expect(editorBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await editorBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => editorBlock.input.parse({ payload: 123 })).toThrow();
  });
});
