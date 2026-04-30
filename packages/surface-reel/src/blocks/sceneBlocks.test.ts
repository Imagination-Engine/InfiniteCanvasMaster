import { describe, it, expect } from 'vitest';
import { sceneBlock, cutBlock } from './sceneBlocks';

describe('Scene and Cut Blocks (Red/Green Phase)', () => {
  it('has valid metadata and schema for Scene', () => {
    expect(sceneBlock.id).toBe('iem.reel.scene');
    const validIn = { imageUrl: 'http://image.com/1.png', durationMs: 2000 };
    expect(sceneBlock.input.parse(validIn)).toEqual({ ...validIn });
  });

  it('has valid metadata and schema for Cut', () => {
    expect(cutBlock.id).toBe('iem.reel.cut');
    const validIn = { type: 'fade', durationMs: 500 };
    expect(cutBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('adversarial: rejects invalid duration for Scene', () => {
    expect(() => sceneBlock.input.parse({ durationMs: -100 })).toThrow();
  });
});