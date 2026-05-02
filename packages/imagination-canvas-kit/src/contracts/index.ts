import { z } from "zod";

/**
 * Base spatial object on the canvas.
 */
export const CanvasObjectSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number().default(0),
  metadata: z.record(z.any()).optional(),
});

export type CanvasObject = z.infer<typeof CanvasObjectSchema>;

/**
 * A specialized object representing a content block.
 */
export const CanvasBlockSchema = CanvasObjectSchema.extend({
  type: z.literal("block"),
  blockType: z.string(),
  data: z.record(z.any()),
  status: z.enum(["idle", "loading", "error", "active"]).default("idle"),
  metadata: z.record(z.any()).optional(),
});

export type CanvasBlock = z.infer<typeof CanvasBlockSchema>;

/**
 * A connection between two objects.
 */
export const CanvasConnectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["semantic", "flow", "data"]).default("semantic"),
  metadata: z.record(z.any()).optional(),
});

export type CanvasConnection = z.infer<typeof CanvasConnectionSchema>;

/**
 * The state of the infinite viewport.
 */
export const CanvasViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
  width: z.number(),
  height: z.number(),
});

export type CanvasViewport = z.infer<typeof CanvasViewportSchema>;

/**
 * Current selection state.
 */
export const CanvasSelectionSchema = z.object({
  objectIds: z.array(z.string()),
  marquee: z
    .object({
      startX: z.number(),
      startY: z.number(),
      endX: z.number(),
      endY: z.number(),
    })
    .optional(),
});

export type CanvasSelection = z.infer<typeof CanvasSelectionSchema>;

/**
 * Events occurring on the canvas.
 */
export const CanvasEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  payload: z.any(),
});

export type CanvasEvent = z.infer<typeof CanvasEventSchema>;

/**
 * Descriptor for block expansion state.
 */
export const ExpansionDescriptorSchema = z.object({
  mode: z.enum([
    "none",
    "peek",
    "inline-expanded",
    "side-panel",
    "focus-region",
    "modal",
    "fullscreen",
    "route",
    "presentation",
  ]),
  surfaceId: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export type ExpansionDescriptor = z.infer<typeof ExpansionDescriptorSchema>;

/**
 * Descriptor for agent/system provenance.
 */
export const ProvenanceDescriptorSchema = z
  .object({
    source: z.enum(["user", "agent", "system"]),
    agentId: z.string().optional(),
    model: z.string().optional(),
    prompt: z.string().optional(),
    timestamp: z.string(),
    confidence: z.number().min(0).max(1).optional(),
  })
  .refine(
    (data) => {
      if (data.source === "agent") {
        return !!data.agentId && !!data.model;
      }
      return true;
    },
    {
      message: "agentId and model are required when source is 'agent'",
    },
  );

export type ProvenanceDescriptor = z.infer<typeof ProvenanceDescriptorSchema>;
