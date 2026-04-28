import { z } from "zod";

export const BALNCE_A2A_PROTOCOL = "balnce.a2a" as const;
export const BALNCE_A2A_VERSION = "0.1.0" as const;

export const DeliveryClassSchema = z.enum([
  "ephemeral",
  "replayable",
  "durable",
  "approval_required",
  "provenance_required",
]);

export type DeliveryClass = z.infer<typeof DeliveryClassSchema>;

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

export type BalnceEnvelopeEventType = z.infer<
  typeof BalnceEnvelopeEventTypeSchema
>;

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

export type EnvelopeActor = z.infer<typeof EnvelopeActorSchema>;

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

export type EnvelopeTarget = z.infer<typeof EnvelopeTargetSchema>;

export const EnvelopeEventSchema = z.object({
  type: BalnceEnvelopeEventTypeSchema.or(z.string()), // Allow extensibility
  phase: z.string().optional(),
  sequence: z.number(),
  timestamp: z.string(),
});

export type EnvelopeEvent = z.infer<typeof EnvelopeEventSchema>;

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

export type EnvelopeInstruction = z.infer<typeof EnvelopeInstructionSchema>;

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

export type EnvelopeContext = z.infer<typeof EnvelopeContextSchema>;

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

export type EnvelopePolicy = z.infer<typeof EnvelopePolicySchema>;

export const EnvelopeProvenanceSchema = z.object({
  vladId: z.string().optional(),
  plogId: z.string().optional(),
  signature: z.string().optional(),
  contentHash: z.string().optional(),
  sourceRefs: z.array(z.string()).optional(),
});

export type EnvelopeProvenance = z.infer<typeof EnvelopeProvenanceSchema>;

export const EnvelopeDeliverySchema = z.object({
  class: DeliveryClassSchema,
  ttlMs: z.number().optional(),
  replayable: z.boolean().optional(),
  durable: z.boolean().optional(),
  ordered: z.boolean().optional(),
});

export type EnvelopeDelivery = z.infer<typeof EnvelopeDeliverySchema>;

export const EnvelopeDebugSchema = z.object({
  compilerNodeId: z.string().optional(),
  mastraWorkflowId: z.string().optional(),
  mastraStepId: z.string().optional(),
  toolName: z.string().optional(),
  modelName: z.string().optional(),
  latencyMs: z.number().optional(),
});

export type EnvelopeDebug = z.infer<typeof EnvelopeDebugSchema>;

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

export type BalnceEnvelope<TPayload = any> = z.infer<
  typeof BalnceEnvelopeSchema
> & {
  payload: TPayload;
};

// --- Topic Helpers ---

export const Topics = {
  dagTrace: (runId: string) => `dag.${runId}.trace`,
  dagNodeEvent: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.event`,
  dagNodeOutput: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.output`,
  dagNodeError: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.error`,
  dagNodeApproval: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.approval`,
  canvasBlockEvent: (canvasId: string, blockId: string) =>
    `canvas.${canvasId}.block.${blockId}.event`,
  openClawTaskEvent: (runtimeId: string, sessionId: string, taskId: string) =>
    `openclaw.${runtimeId}.session.${sessionId}.task.${taskId}.event`,
  approvalEvent: (runId: string) => `approval.${runId}.event`,
  artifactEvent: (artifactId: string) => `artifact.${artifactId}.event`,
  provenanceEvent: (traceId: string) => `provenance.${traceId}.event`,
};

// --- Legacy Support & Helpers ---

export function wrapInEnvelope<T>(params: any): BalnceEnvelope<T> {
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
  } as BalnceEnvelope<T>;
}

export function serializeEnvelope(envelope: BalnceEnvelope<any>): string {
  // NDJSON compatible single line serialization
  return JSON.stringify(envelope);
}

// --- Fabric Interfaces ---

export interface A2AMessageTransport {
  publish<TPayload>(
    topic: string,
    envelope: BalnceEnvelope<TPayload>,
  ): Promise<void>;
  subscribe<TPayload>(
    topic: string,
    handler: (envelope: BalnceEnvelope<TPayload>) => void | Promise<void>,
    options?: any,
  ): { unsubscribe: () => void };
  close?(): Promise<void>;
}

export interface A2AReplayQuery {
  traceId?: string;
  runId?: string;
  topicPrefix?: string;
  sourceId?: string;
  targetId?: string;
  eventTypes?: BalnceEnvelopeEventType[];
  fromSequence?: number;
  toSequence?: number;
  fromTimestamp?: string;
  toTimestamp?: string;
}

export interface A2AMessageFabric extends A2AMessageTransport {
  replay?(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
}

export interface A2AEventLog {
  append(envelope: BalnceEnvelope): Promise<void>;
  query(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
  clear?(query?: A2AReplayQuery): Promise<void>;
}

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  modifiedEnvelope?: BalnceEnvelope;
}

export interface A2APolicyEngine {
  evaluatePublish(args: {
    topic: string;
    envelope: BalnceEnvelope;
  }): Promise<PolicyDecision>;
  evaluateDelivery(args: {
    topic: string;
    envelope: BalnceEnvelope;
    subscriber?: unknown;
  }): Promise<PolicyDecision>;
  evaluateInputAdaptation(args: {
    envelopes: BalnceEnvelope[];
    nodeSpec: unknown;
    toolName?: string;
  }): Promise<PolicyDecision>;
}

export interface NodeInputAdapter<TInput = unknown> {
  nodeType?: string;
  toolName?: string;
  fromEnvelopeBatch(args: {
    envelopes: BalnceEnvelope[];
    baseInput: TInput;
    nodeSpec: any;
    runContext: any;
  }): Promise<TInput> | TInput;
}
