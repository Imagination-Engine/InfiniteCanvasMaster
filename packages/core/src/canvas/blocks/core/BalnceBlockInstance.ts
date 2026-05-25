import { z } from "zod";

/**
 * Union representing the runtime execution status of a block instance.
 */
export type BlockRuntimeStatus =
  | "idle"
  | "running"
  | "thinking"
  | "generating"
  | "waiting-for-user"
  | "complete"
  | "error"
  | "paused";

/**
 * Interface representing a concrete block instance placed on the canvas.
 */
export interface BalnceBlockInstance {
  id: string;
  canvasId: string;
  specId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  runtimeStatus: BlockRuntimeStatus;
  props: Record<string, unknown>;
  agentInstanceId?: string;
  memoryRefs: string[];
  artifactRefs: string[];
  connectionRefs: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Zod validator schema for BalnceBlockInstance runtime validations.
 */
export const BalnceBlockInstanceSchema = z.object({
  id: z.string(),
  canvasId: z.string(),
  specId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  runtimeStatus: z
    .enum([
      "idle",
      "running",
      "thinking",
      "generating",
      "waiting-for-user",
      "complete",
      "error",
      "paused",
    ])
    .default("idle"),
  props: z.record(z.any()).default({}),
  agentInstanceId: z.string().optional(),
  memoryRefs: z.array(z.string()).default([]),
  artifactRefs: z.array(z.string()).default([]),
  connectionRefs: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
