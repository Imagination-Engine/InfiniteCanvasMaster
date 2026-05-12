// @ts-nocheck
import { z } from "zod";
export const BALNCE_A2A_PROTOCOL = "balnce.a2a";
export const BALNCE_A2A_VERSION = "0.1.0";
export const DeliveryClassSchema = z.enum([
  "ephemeral",
  "replayable",
  "durable",
  "approval_required",
  "provenance_required",
]);
export const BalnceEnvelopeEventTypeSchema = z.enum([
  "run.started",
  "run.progress",
  "run.completed",
  "run.failed",
  "node.started",
  "node.input.prepared",
  "node.output",
  "node.completed",
  "node.failed",
  "tool.started",
  "tool.output",
  "tool.completed",
  "tool.failed",
  "agent.message",
  "agent.delegated",
  "approval.required",
  "approval.granted",
  "approval.denied",
  "artifact.created",
  "memory.read",
  "memory.written",
  "canvas.block.created",
  "canvas.block.updated",
  "openclaw.task.started",
  "openclaw.task.progress",
  "openclaw.task.completed",
  "openclaw.task.failed",
  "policy.blocked",
  "provenance.recorded",
]);
export const EnvelopeActorSchema = z.object({
  type: z.enum([
    "user",
    "system",
    "agent",
    "block",
    "tool",
    "workflow",
    "canvas",
    "openclaw",
    "edge-twin",
    "device",
    "model",
  ]),
  id: z.string(),
  name: z.string().optional(),
  runtime: z
    .enum(["local", "device-mesh", "edge-twin", "cloud", "unknown"])
    .optional(),
});
export const EnvelopeTargetSchema = z.object({
  type: z.enum([
    "agent",
    "block",
    "tool",
    "workflow",
    "canvas",
    "topic",
    "broadcast",
    "openclaw",
    "approval-queue",
  ]),
  id: z.string().optional(),
  topic: z.string().optional(),
});
export const EnvelopeEventSchema = z.object({
  type: BalnceEnvelopeEventTypeSchema.or(z.string()), // Allow extensibility
  phase: z.string().optional(),
  sequence: z.number(),
  timestamp: z.string(),
});
export const EnvelopeInstructionSchema = z.object({
  text: z.string(),
  origin: z.enum([
    "system",
    "user",
    "agent",
    "tool",
    "retrieved_content",
    "external_content",
  ]),
  trust: z.enum(["trusted", "bounded", "untrusted"]),
  priority: z.enum(["low", "normal", "high", "critical"]).optional(),
  mayModifyGoal: z.boolean().optional(),
  mayUseTools: z.boolean().optional(),
  mayEscalatePermissions: z.boolean().optional(),
});
export const EnvelopeContextSchema = z.object({
  summary: z.string().optional(),
  refs: z
    .array(
      z.object({
        type: z.string(),
        id: z.string(),
        label: z.string().optional(),
      }),
    )
    .optional(),
  values: z.record(z.any()).optional(),
});
export const EnvelopePolicySchema = z.object({
  visibility: z.enum(["private", "workspace", "agent-group", "public"]),
  sensitivity: z.enum(["low", "medium", "high", "secret"]).optional(),
  requiresApproval: z.boolean().optional(),
  allowedCapabilities: z.array(z.string()).optional(),
  deniedCapabilities: z.array(z.string()).optional(),
  budgetId: z.string().optional(),
  maxSpendCredits: z.number().optional(),
  redaction: z.enum(["none", "compact", "full"]).optional(),
});
export const EnvelopeProvenanceSchema = z.object({
  vladId: z.string().optional(),
  plogId: z.string().optional(),
  signature: z.string().optional(),
  contentHash: z.string().optional(),
  sourceRefs: z.array(z.string()).optional(),
});
export const EnvelopeDeliverySchema = z.object({
  class: DeliveryClassSchema,
  ttlMs: z.number().optional(),
  replayable: z.boolean().optional(),
  durable: z.boolean().optional(),
  ordered: z.boolean().optional(),
});
export const EnvelopeDebugSchema = z.object({
  compilerNodeId: z.string().optional(),
  mastraWorkflowId: z.string().optional(),
  mastraStepId: z.string().optional(),
  toolName: z.string().optional(),
  modelName: z.string().optional(),
  latencyMs: z.number().optional(),
});
/**
 * The BalnceEnvelope is the canonical message container.
 */
export const BalnceEnvelopeSchema = z.object({
  protocol: z.literal(BALNCE_A2A_PROTOCOL),
  version: z.string().default(BALNCE_A2A_VERSION),
  id: z.string(),
  traceId: z.string(),
  runId: z.string(),
  parentId: z.string().optional(),
  causationId: z.string().optional(),
  correlationId: z.string().optional(),
  idempotencyKey: z.string().optional(),
  source: EnvelopeActorSchema,
  target: EnvelopeTargetSchema.optional(),
  event: EnvelopeEventSchema,
  instruction: EnvelopeInstructionSchema.optional(),
  context: EnvelopeContextSchema.optional(),
  payload: z.any(),
  policy: EnvelopePolicySchema.optional(),
  provenance: EnvelopeProvenanceSchema.optional(),
  delivery: EnvelopeDeliverySchema.optional(),
  debug: EnvelopeDebugSchema.optional(),
});
// --- Topic Helpers ---
export const Topics = {
  dagTrace: (runId) => `dag.${runId}.trace`,
  dagNodeEvent: (runId, nodeId) => `dag.${runId}.node.${nodeId}.event`,
  dagNodeOutput: (runId, nodeId) => `dag.${runId}.node.${nodeId}.output`,
  dagNodeError: (runId, nodeId) => `dag.${runId}.node.${nodeId}.error`,
  dagNodeApproval: (runId, nodeId) => `dag.${runId}.node.${nodeId}.approval`,
  canvasBlockEvent: (canvasId, blockId) =>
    `canvas.${canvasId}.block.${blockId}.event`,
  openClawTaskEvent: (runtimeId, sessionId, taskId) =>
    `openclaw.${runtimeId}.session.${sessionId}.task.${taskId}.event`,
  approvalEvent: (runId) => `approval.${runId}.event`,
  artifactEvent: (artifactId) => `artifact.${artifactId}.event`,
  provenanceEvent: (traceId) => `provenance.${traceId}.event`,
};
// --- Legacy Support & Helpers ---
export function wrapInEnvelope(params) {
  const { randomUUID } = require("crypto");
  const now = new Date().toISOString();
  // Basic mapping for legacy callers if needed, though they should be updated
  return {
    protocol: BALNCE_A2A_PROTOCOL,
    version: BALNCE_A2A_VERSION,
    id: params.id || randomUUID(),
    traceId: params.traceId || randomUUID(),
    runId: params.runId || params.traceId || randomUUID(),
    source: params.source || { type: "system", id: "legacy-bridge" },
    event: params.event || {
      type: "node.output",
      sequence: 0,
      timestamp: now,
    },
    payload: params.payload,
    context: params.context,
    ...params,
  };
}
export function serializeEnvelope(envelope) {
  // NDJSON compatible single line serialization
  return JSON.stringify(envelope);
}
