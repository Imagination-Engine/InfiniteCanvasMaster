import { describe, it, expect } from 'vitest';
import { cameraBlock } from './cameraBlock';

describe('Camera Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(cameraBlock.id).toBe('iem.playable.camera');
    expect(cameraBlock.name).toBe('Camera');
    
    const validIn = { payload: 'test' };
    expect(cameraBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await cameraBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => cameraBlock.input.parse({ payload: 123 })).toThrow();
  });
});
