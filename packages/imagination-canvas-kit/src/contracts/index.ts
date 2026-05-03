import { z } from "zod";

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
 * Capabilities of a canvas block.
 */
export const CanvasBlockCapabilitiesSchema = z.object({
  canMove: z.boolean().optional(),
  canResize: z.boolean().optional(),
  canRotate: z.boolean().optional(),
  canEditInline: z.boolean().optional(),
  canExpand: z.boolean().optional(),
  canConfigure: z.boolean().optional(),
  canConnect: z.boolean().optional(),
});

export type CanvasBlockCapabilities = z.infer<
  typeof CanvasBlockCapabilitiesSchema
>;

/**
 * States of a canvas object.
 */
export const CanvasObjectStateSchema = z.enum([
  "idle",
  "selected",
  "hovered",
  "editing",
  "generating",
  "thinking",
  "waiting-for-user",
  "running",
  "complete",
  "error",
  "paused",
  "locked",
]);

export type CanvasObjectState = z.infer<typeof CanvasObjectStateSchema>;

/**
 * Base properties for all canvas objects.
 */
export const BaseCanvasObjectSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number().default(0),
  parentId: z.string().optional(),
  status: CanvasObjectStateSchema.default("idle"),
  capabilities: CanvasBlockCapabilitiesSchema.default({}),
  provenance: ProvenanceDescriptorSchema.optional(),
  expansion: ExpansionDescriptorSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

export type BaseCanvasObject = z.infer<typeof BaseCanvasObjectSchema>;

/**
 * Specific block types.
 */
export const NoteObjectSchema = BaseCanvasObjectSchema.extend({
  type: z.literal("block"),
  blockKind: z.literal("note"),
  data: z.object({
    content: z.string(),
  }),
});

export type NoteObject = z.infer<typeof NoteObjectSchema>;

export const AgentBlockObjectSchema = BaseCanvasObjectSchema.extend({
  type: z.literal("block"),
  blockKind: z.literal("agent"),
  agentId: z.string(),
  role: z.string(),
  instructions: z.string().optional(),
  tools: z.array(z.string()).optional(),
});

export type AgentBlockObject = z.infer<typeof AgentBlockObjectSchema>;

/**
 * Union of all supported canvas objects.
 */
export const CanvasObjectSchema = z.union([
  z
    .object({
      type: z.literal("shape"),
      shapeType: z.enum(["rectangle", "circle", "arrow"]),
    })
    .merge(BaseCanvasObjectSchema),
  NoteObjectSchema,
  AgentBlockObjectSchema,
  z
    .object({
      type: z.literal("block"),
      blockKind: z.enum([
        "artifact",
        "goal",
        "app",
        "chat",
        "memory-cluster",
        "research-stream",
      ]),
    })
    .merge(BaseCanvasObjectSchema),
]);

export type CanvasObject = z.infer<typeof CanvasObjectSchema>;

/**
 * Legacy/Simple CanvasBlock for compatibility (if needed).
 */
export const CanvasBlockSchema = BaseCanvasObjectSchema.extend({
  type: z.literal("block"),
  blockType: z.string(),
  data: z.record(z.any()),
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
