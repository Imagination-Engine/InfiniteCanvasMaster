import { z } from 'zod';
import { CameraView } from './CameraView';
import type { BlockDefinition } from '@iem/core';

export const cameraInput = z.object({
  payload: z.string().optional()
});

export const cameraOutput = z.object({
  success: z.boolean()
});

export const cameraBlock: BlockDefinition<typeof cameraInput, typeof cameraOutput> = {
  id: 'iem.playable.camera',
  name: 'Camera',
  description: 'Auto-generated Camera block',
  category: 'uncategorized',
  input: cameraInput,
  output: cameraOutput,
  view: CameraView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_camera',
    invoke: async (input) => {
      const parsed = cameraInput.parse(input);
      return { success: true };
    }
  }
};
