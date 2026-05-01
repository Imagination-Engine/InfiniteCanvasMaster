# 20 — Contract Appendix TypeScript

The following contracts are implementation guides. Adapt names to repo conventions, but preserve semantics.

```ts
export type BalnceFabricLane =
  | "document_state"
  | "presence"
  | "agent_stream"
  | "command_control"
  | "workflow_trace"
  | "runtime_simulation"
  | "durable_event"
  | "provenance"
  | "ui_projection";

export type FabricDeliveryClass =
  | "ephemeral"
  | "replayable"
  | "durable"
  | "approval_required"
  | "provenance_required"
  | "realtime_low_latency";

export type FabricOrdering = "none" | "per_topic" | "causal" | "strict";

export type FabricEndpointType =
  | "user"
  | "agent"
  | "block"
  | "tool"
  | "workflow"
  | "runtime"
  | "canvas"
  | "system"
  | "broadcast";

export interface FabricEndpoint {
  type: FabricEndpointType;
  id: string;
  name?: string;
  topic?: string;
}

export interface FabricEventDescriptor {
  type: string;
  phase?: string;
  timestamp: string;
  sequence?: number;
}

export interface FabricDelivery {
  class: FabricDeliveryClass;
  ordering?: FabricOrdering;
  replayable?: boolean;
  durable?: boolean;
  ttlMs?: number;
  idempotencyKey?: string;
}

export type FabricInstructionTrust =
  | "system"
  | "user"
  | "delegated_agent"
  | "agent_advisory"
  | "tool_output"
  | "retrieved_content"
  | "untrusted";

export interface FabricInstruction {
  text: string;
  trust: FabricInstructionTrust;
  priority?: "low" | "normal" | "high" | "critical";
  mayModifyGoal?: boolean;
  mayUseTools?: boolean;
  mayEscalatePermissions?: boolean;
}

export interface FabricContextRef {
  type:
    | "memory"
    | "artifact"
    | "message"
    | "file"
    | "canvas_object"
    | "workflow"
    | "runtime";
  id: string;
}

export interface FabricContext {
  summary?: string;
  refs?: FabricContextRef[];
  values?: Record<string, unknown>;
}

export interface FabricPolicy {
  visibility?: "private" | "workspace" | "agent_group" | "public";
  sensitivity?: "low" | "medium" | "high" | "secret";
  requiresApproval?: boolean;
  allowedCapabilities?: string[];
  deniedCapabilities?: string[];
  budgetId?: string;
  redaction?: "none" | "summary_only" | "hash_only" | "secret";
}

export interface FabricProvenance {
  vladId?: string;
  plogId?: string;
  signature?: string;
  contentHash?: string;
  sourceEnvelopeIds?: string[];
}

export interface BalnceEnvelope<TPayload = unknown> {
  protocol: "balnce.fabric";
  version: "0.2.0";
  id: string;
  traceId: string;
  runId?: string;
  parentId?: string;
  correlationId?: string;
  causationId?: string;
  lane: BalnceFabricLane;
  source: FabricEndpoint;
  target?: FabricEndpoint;
  event: FabricEventDescriptor;
  delivery: FabricDelivery;
  instruction?: FabricInstruction;
  context?: FabricContext;
  policy?: FabricPolicy;
  provenance?: FabricProvenance;
  payload: TPayload;
}

export interface FabricSubscriptionFilter {
  lanes?: BalnceFabricLane[];
  topics?: string[];
  traceId?: string;
  runId?: string;
  canvasId?: string;
  blockId?: string;
  eventTypes?: string[];
}

export type FabricHandler<T = unknown> = (
  envelope: BalnceEnvelope<T>,
) => void | Promise<void>;
export type FabricUnsubscribe = () => void | Promise<void>;

export interface FabricTransportCapability {
  lane?: BalnceFabricLane;
  deliveryClass?: FabricDeliveryClass;
  bidirectional?: boolean;
  durable?: boolean;
  replayable?: boolean;
}

export interface FabricTransport {
  readonly id: string;
  readonly kind: string;
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
  supports?(capability: FabricTransportCapability): boolean;
}

export interface FabricRouter {
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
  route<T>(envelope: BalnceEnvelope<T>): Promise<FabricTransport[]>;
}

export interface NodeInputAdapter<TInput = unknown> {
  readonly id: string;
  readonly supports: string[];
  adapt(args: {
    baseInput: TInput;
    envelopes: BalnceEnvelope[];
    nodeSpec: unknown;
    traceId: string;
  }): Promise<TInput> | TInput;
}
```
