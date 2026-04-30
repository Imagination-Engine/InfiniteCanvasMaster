import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const physicsInput = z.object({
  mass: z.number().default(1).describe("Mass of the entity in kg"),
  gravityScale: z.number().default(1).describe("Multiplier for global gravity"),
  friction: z.number().default(0.1).describe("Air and surface friction (0-1)"),
  restitution: z
    .number()
    .default(0.5)
    .describe("Bounciness of the entity (0-1)"),
  isStatic: z
    .boolean()
    .default(false)
    .describe(
      "If true, the entity will not move but others will collide with it",
    ),
});

export const physicsOutput = z.object({
  entityId: z.string(),
  velocity: z.object({
    x: z.number(),
    y: z.number(),
  }),
  acceleration: z.object({
    x: z.number(),
    y: z.number(),
  }),
  appliedForces: z.array(
    z.object({
      label: z.string(),
      vector: z.object({ x: z.number(), y: z.number() }),
    }),
  ),
});

export const physicsEntityBlock: BlockDefinition<
  typeof physicsInput,
  typeof physicsOutput
> = {
  id: "iem.playable.physicsEntity",
  name: "Physics Entity",
  description: "Applies rigid-body physics behavior to a game object.",
  category: "playable",
  input: physicsInput,
  output: physicsOutput,
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "execute_physics",
    invoke: async (input: any) => {
      return {
        entityId: `phys-${Math.random().toString(36).substr(2, 9)}`,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        appliedForces: [
          {
            label: "gravity",
            vector: { x: 0, y: 9.8 * (input.gravityScale || 1) },
          },
        ],
      };
    },
  },
};
