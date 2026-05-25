import { z } from "zod";

/**
 * Enumeration of all supported core agentic block event types.
 */
export enum BalnceBlockEventType {
  CREATED = "block.created",
  INVOKED = "block.invoked",
  INPUT_RECEIVED = "block.input.received",
  CONTEXT_BUILT = "block.context.built",
  PLAN_CREATED = "block.plan.created",
  TOOL_REQUESTED = "block.tool.requested",
  TOOL_COMPLETED = "block.tool.completed",
  OUTPUT_CREATED = "block.output.created",
  ARTIFACT_CREATED = "block.artifact.created",
  ERROR = "block.error",
}

export const BlockCreatedPayloadSchema = z.object({
  blockId: z.string(),
  specId: z.string(),
  canvasId: z.string(),
});

export const BlockInvokedPayloadSchema = z.object({
  blockId: z.string(),
  input: z.record(z.any()),
});

export const BlockInputReceivedPayloadSchema = z.object({
  blockId: z.string(),
  portName: z.string(),
  value: z.any(),
});

export const BlockContextBuiltPayloadSchema = z.object({
  blockId: z.string(),
  context: z.record(z.any()),
});

export const BlockPlanCreatedPayloadSchema = z.object({
  blockId: z.string(),
  plan: z.any(),
});

export const BlockToolRequestedPayloadSchema = z.object({
  blockId: z.string(),
  toolName: z.string(),
  input: z.any(),
});

export const BlockToolCompletedPayloadSchema = z.object({
  blockId: z.string(),
  toolName: z.string(),
  output: z.any(),
  success: z.boolean(),
});

export const BlockOutputCreatedPayloadSchema = z.object({
  blockId: z.string(),
  output: z.record(z.any()),
});

export const BlockArtifactCreatedPayloadSchema = z.object({
  blockId: z.string(),
  artifactId: z.string(),
  artifactType: z.string(),
});

export const BlockErrorPayloadSchema = z.object({
  blockId: z.string(),
  error: z.string(),
});

/**
 * Union map linking event types to validation schemas.
 */
export const BlockEventPayloadSchemas = {
  [BalnceBlockEventType.CREATED]: BlockCreatedPayloadSchema,
  [BalnceBlockEventType.INVOKED]: BlockInvokedPayloadSchema,
  [BalnceBlockEventType.INPUT_RECEIVED]: BlockInputReceivedPayloadSchema,
  [BalnceBlockEventType.CONTEXT_BUILT]: BlockContextBuiltPayloadSchema,
  [BalnceBlockEventType.PLAN_CREATED]: BlockPlanCreatedPayloadSchema,
  [BalnceBlockEventType.TOOL_REQUESTED]: BlockToolRequestedPayloadSchema,
  [BalnceBlockEventType.TOOL_COMPLETED]: BlockToolCompletedPayloadSchema,
  [BalnceBlockEventType.OUTPUT_CREATED]: BlockOutputCreatedPayloadSchema,
  [BalnceBlockEventType.ARTIFACT_CREATED]: BlockArtifactCreatedPayloadSchema,
  [BalnceBlockEventType.ERROR]: BlockErrorPayloadSchema,
};
