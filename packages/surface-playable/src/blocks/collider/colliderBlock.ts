import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const colliderInput = z.object({
  shape: z.enum(["rectangle", "circle", "capsule"]).default("rectangle"),
  width: z.number().default(64),
  height: z.number().default(64),
  radius: z.number().optional().default(32),
  isTrigger: z
    .boolean()
    .default(false)
    .describe(
      "If true, the collider detects overlaps but does not physically block other objects",
    ),
  sensorRange: z
    .number()
    .optional()
    .default(0)
    .describe("Additional detection radius for proximity sensing"),
  collisionGroup: z.string().default("default"),
});

export const colliderOutput = z.object({
  entityId: z.string(),
  isColliding: z.boolean(),
  activeOverlaps: z
    .array(z.string())
    .describe(
      "List of other entity IDs currently overlapping with this collider",
    ),
  lastCollision: z
    .object({
      otherId: z.string(),
      impactForce: z.number(),
      normal: z.object({ x: z.number(), y: z.number() }),
    })
    .optional(),
});

export const colliderBlock: BlockDefinition<
  typeof colliderInput,
  typeof colliderOutput
> = {
  id: "iem.playable.collider",
  name: "Hitbox Collider",
  description: "Defines the physical boundaries or trigger zone for an entity.",
  category: "playable",
  input: colliderInput,
  output: colliderOutput,
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "execute_collider",
    invoke: async (input: any) => {
      return {
        entityId: `coll-${Math.random().toString(36).substr(2, 9)}`,
        isColliding: false,
        activeOverlaps: [],
      };
    },
  },
};
