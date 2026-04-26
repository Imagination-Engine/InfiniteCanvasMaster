import { z } from "zod";

export const BalnceBlockKindSchema = z.enum([
  "chat",
  "agent",
  "goal",
  "artifact",
  "memory-cluster",
  "research-stream",
  "intent",
  "offer-commerce",
  "identity-wallet",
  "workflow",
  "knowledge-pod",
  "app",
  "aura",
  "plog-provenance",
  "edge-twin",
  "device-mesh",
]);

export type BalnceBlockKind = z.infer<typeof BalnceBlockKindSchema>;

export const CanvasObjectSchema = z.object({
  id: z.string(),
  type: z.string(),
  kind: BalnceBlockKindSchema.optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().default(0),
  status: z
    .enum([
      "idle",
      "active",
      "thinking",
      "generating",
      "waiting-for-user",
      "running",
      "complete",
      "error",
      "paused",
    ])
    .default("idle"),
  metadata: z.record(z.unknown()).default({}),
});

export type CanvasObject = z.infer<typeof CanvasObjectSchema>;

export interface CanvasViewport {
  id: string;
  x: number;
  y: number;
  zoom: number;
  mode: "free" | "focus" | "presentation" | "follow" | "locked";
}

export type CanvasEvent =
  | { type: "canvas.loaded"; canvasId: string }
  | { type: "object.created"; object: CanvasObject }
  | { type: "object.updated"; id: string; patch: Partial<CanvasObject> }
  | { type: "viewport.changed"; viewport: CanvasViewport };
