import { describe, it, expect } from 'vitest';
import { exportBlock } from './exportBlock';

describe('Export Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(exportBlock.id).toBe('iem.reel.export');
    expect(exportBlock.name).toBe('Export');
    
    const validIn = { payload: 'test' };
    expect(exportBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await exportBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => exportBlock.input.parse({ payload: 123 })).toThrow();
  });
});
