import { z } from 'zod';
import { JoystickView } from './JoystickView';
import type { BlockDefinition } from '@iem/core';

export const joystickInput = z.object({
  payload: z.string().optional()
});

export const joystickOutput = z.object({
  success: z.boolean()
});

export const joystickBlock: BlockDefinition<typeof joystickInput, typeof joystickOutput> = {
  id: 'iem.playable.joystick',
  name: 'Joystick',
  description: 'Auto-generated Joystick block',
  category: 'uncategorized',
  input: joystickInput,
  output: joystickOutput,
  view: JoystickView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_joystick',
    invoke: async (input) => {
      const parsed = joystickInput.parse(input);
      return { success: true };
    }
  }
};
