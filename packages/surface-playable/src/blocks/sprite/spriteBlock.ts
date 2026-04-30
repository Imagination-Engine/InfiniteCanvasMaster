import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const spriteInput = z.object({
  url: z.string().describe("The source URL of the image asset"),
  width: z
    .number()
    .default(64)
    .describe("The visual width of the sprite in game units"),
  height: z
    .number()
    .default(64)
    .describe("The visual height of the sprite in game units"),
  x: z.number().optional().default(0),
  y: z.number().optional().default(0),
  alpha: z.number().min(0).max(1).default(1),
  tint: z.string().optional().describe("Hex color tint (e.g. #ffffff)"),
});

export const spriteOutput = z.object({
  entityId: z
    .string()
    .describe("The unique ID of the spawned sprite in the game engine"),
  rendered: z.boolean(),
  currentBounds: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
});

export const spriteBlock: BlockDefinition<
  typeof spriteInput,
  typeof spriteOutput
> = {
  id: "iem.playable.sprite",
  name: "Game Sprite",
  description: "A 2D visual entity within a playable scene.",
  category: "playable",
  input: spriteInput,
  output: spriteOutput,
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "execute_sprite",
    invoke: async (input: any) => {
      return {
        entityId: `sprite-${Math.random().toString(36).substr(2, 9)}`,
        rendered: true,
        currentBounds: {
          x: input.x || 0,
          y: input.y || 0,
          w: input.width || 64,
          h: input.height || 64,
        },
      };
    },
  },
};
