import { describe, it, expect } from 'vitest';
import { joystickBlock } from './joystickBlock';

describe('Joystick Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(joystickBlock.id).toBe('iem.playable.joystick');
    expect(joystickBlock.name).toBe('Joystick');
    
    const validIn = { payload: 'test' };
    expect(joystickBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await joystickBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => joystickBlock.input.parse({ payload: 123 })).toThrow();
  });
});
