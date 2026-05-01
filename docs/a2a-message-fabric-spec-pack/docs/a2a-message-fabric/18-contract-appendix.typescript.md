# 18 — Contract Appendix TypeScript

```ts
export const BALNCE_A2A_PROTOCOL = "balnce.a2a" as const;
export const BALNCE_A2A_VERSION = "0.1.0" as const;

export type DeliveryClass =
  | "ephemeral"
  | "replayable"
  | "durable"
  | "approval_required"
  | "provenance_required";

export type BalnceEnvelopeEventType =
  | "run.started"
  | "run.progress"
  | "run.completed"
  | "run.failed"
  | "node.started"
  | "node.input.prepared"
  | "node.output"
  | "node.completed"
  | "node.failed"
  | "tool.started"
  | "tool.output"
  | "tool.completed"
  | "tool.failed"
  | "agent.message"
  | "agent.delegated"
  | "approval.required"
  | "approval.granted"
  | "approval.denied"
  | "artifact.created"
  | "memory.read"
  | "memory.written"
  | "canvas.block.created"
  | "canvas.block.updated"
  | "openclaw.task.started"
  | "openclaw.task.progress"
  | "openclaw.task.completed"
  | "openclaw.task.failed"
  | "policy.blocked"
  | "provenance.recorded";

export type EnvelopeActor = {
  type:
    | "user"
    | "system"
    | "agent"
    | "block"
    | "tool"
    | "workflow"
    | "canvas"
    | "openclaw"
    | "edge-twin"
    | "device"
    | "model";
  id: string;
  name?: string;
  runtime?: "local" | "device-mesh" | "edge-twin" | "cloud" | "unknown";
};
export type EnvelopeTarget = {
  type:
    | "agent"
    | "block"
    | "tool"
    | "workflow"
    | "canvas"
    | "topic"
    | "broadcast"
    | "openclaw"
    | "approval-queue";
  id?: string;
  topic?: string;
};
export type EnvelopeEvent = {
  type: BalnceEnvelopeEventType;
  phase?: string;
  sequence: number;
  timestamp: string;
};
export type EnvelopeInstruction = {
  text: string;
  origin:
    | "system"
    | "user"
    | "agent"
    | "tool"
    | "retrieved_content"
    | "external_content";
  trust: "trusted" | "bounded" | "untrusted";
  priority?: "low" | "normal" | "high" | "critical";
  mayModifyGoal?: boolean;
  mayUseTools?: boolean;
  mayEscalatePermissions?: boolean;
};
export type EnvelopeContext = {
  summary?: string;
  refs?: Array<{ type: string; id: string; label?: string }>;
  values?: Record<string, unknown>;
};
export type EnvelopePolicy = {
  visibility: "private" | "workspace" | "agent-group" | "public";
  sensitivity?: "low" | "medium" | "high" | "secret";
  requiresApproval?: boolean;
  allowedCapabilities?: string[];
  deniedCapabilities?: string[];
  budgetId?: string;
  maxSpendCredits?: number;
  redaction?: "none" | "compact" | "full";
};
export type EnvelopeProvenance = {
  vladId?: string;
  plogId?: string;
  signature?: string;
  contentHash?: string;
  sourceRefs?: string[];
};
export type EnvelopeDelivery = {
  class: DeliveryClass;
  ttlMs?: number;
  replayable?: boolean;
  durable?: boolean;
  ordered?: boolean;
};
export type EnvelopeDebug = {
  compilerNodeId?: string;
  mastraWorkflowId?: string;
  mastraStepId?: string;
  toolName?: string;
  modelName?: string;
  latencyMs?: number;
};

export type BalnceEnvelope<TPayload = unknown> = {
  protocol: typeof BALNCE_A2A_PROTOCOL;
  version: string;
  id: string;
  traceId: string;
  runId: string;
  parentId?: string;
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  source: EnvelopeActor;
  target?: EnvelopeTarget;
  event: EnvelopeEvent;
  instruction?: EnvelopeInstruction;
  context?: EnvelopeContext;
  payload: TPayload;
  policy?: EnvelopePolicy;
  provenance?: EnvelopeProvenance;
  delivery?: EnvelopeDelivery;
  debug?: EnvelopeDebug;
};

export interface A2AMessageTransport {
  publish<TPayload>(
    topic: string,
    envelope: BalnceEnvelope<TPayload>,
  ): Promise<void>;
  subscribe<TPayload>(
    topic: string,
    handler: (envelope: BalnceEnvelope<TPayload>) => void | Promise<void>,
    options?: A2ASubscriptionOptions,
  ): { unsubscribe: () => void };
  close?(): Promise<void>;
}

export interface A2AMessageFabric extends A2AMessageTransport {
  replay?(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
}

export type A2AReplayQuery = {
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
};

export interface A2AEventLog {
  append(envelope: BalnceEnvelope): Promise<void>;
  query(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
  clear?(query?: A2AReplayQuery): Promise<void>;
}
```
