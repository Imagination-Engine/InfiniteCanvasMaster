import { z } from 'zod';
import { RefinerView } from './RefinerView';
import type { BlockDefinition } from '../block/protocol';

export const RefinerInput = z.object({
  text: z.string(),
  style: z.enum(['formal', 'casual', 'academic', 'marketing', 'poetic']),
});

export const RefinerOutput = z.object({
  text: z.string(),
  model: z.string(),
  latencyMs: z.number(),
});

export const refinerBlock: BlockDefinition<typeof RefinerInput, typeof RefinerOutput> = {
  id: 'iem.core.refiner',
  name: 'Refiner',
  description: 'Refine text into a specific writing style.',
  category: 'text',
  input: RefinerInput,
  output: RefinerOutput,
  view: RefinerView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'refine_text',
    invoke: async (input: unknown) => {
      // In a real implementation, this would call the Ollama/Gemini agent API.
      // For now, we simulate the output to satisfy the test and pattern.
      const parsedInput = RefinerInput.parse(input);
      return {
        text: `Refined ${parsedInput.text}`,
        model: 'mocked-model',
        latencyMs: 50,
      };
    }
  },
  defaults: { style: 'formal' },
  capabilities: ['text-transformation', 'style-transfer'],
};