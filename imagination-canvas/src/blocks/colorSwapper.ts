import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const ColorSwapperInput = z.object({
  imagePrimary: z.string(),
  imagePaletteSource: z.string(),
});

export const ColorSwapperOutput = z.object({
  image: z.string(),
});

export const colorSwapperBlock: BlockDefinition<typeof ColorSwapperInput, typeof ColorSwapperOutput> = {
  id: 'iem.core.colorSwapper',
  name: 'Color Swapper',
  description: 'Swap colors in images.',
  category: 'image',
  input: ColorSwapperInput,
  output: ColorSwapperOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'color_swap',
    invoke: async (input: unknown) => {
      ColorSwapperInput.parse(input);
      return { image: 'mock-image-url' };
    }
  }
};