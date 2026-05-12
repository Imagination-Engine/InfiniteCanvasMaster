// @ts-nocheck
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
export const AgentBlockObjectSchema = BaseCanvasObjectSchema.extend({
  type: z.literal("block"),
  blockKind: z.literal("agent"),
  agentId: z.string(),
  role: z.string(),
  instructions: z.string().optional(),
  tools: z.array(z.string()).optional(),
});
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
/**
 * A connection between two objects.
 */
export const CanvasConnectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["semantic", "flow", "data"]).default("semantic"),
  label: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
/**
 * A persistent behavioral relationship.
 */
export const CanvasBindingSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  targetId: z.string(),
  type: z.enum(["follow", "stick", "observe", "lock-to"]),
  config: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});
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
/**
 * Events occurring on the canvas.
 */
export const CanvasEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  payload: z.any(),
});
/**
 * Legacy/Simple CanvasBlock for compatibility (if needed).
 */
export const CanvasBlockSchema = BaseCanvasObjectSchema.extend({
  type: z.literal("block"),
  blockType: z.string(),
  data: z.record(z.any()),
});
