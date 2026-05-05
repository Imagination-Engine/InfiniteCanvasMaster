// @ts-nocheck
import type { BalnceFabricLane } from "./lanes";
import crypto from "crypto";

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

/**
 * Creates a valid v2 BalnceEnvelope.
 */
export function createEnvelope<T>(
  params: Omit<
    BalnceEnvelope<T>,
    "protocol" | "version" | "id" | "traceId" | "event"
  > & {
    id?: string;
    traceId?: string;
    event: Omit<FabricEventDescriptor, "timestamp"> & { timestamp?: string };
  },
): BalnceEnvelope<T> {
  const { event, ...rest } = params;

  return {
    protocol: "balnce.fabric",
    version: "0.2.0",
    id: params.id || crypto.randomUUID(),
    traceId: params.traceId || crypto.randomUUID(),
    ...rest,
    event: {
      timestamp: new Date().toISOString(),
      ...event,
    },
  } as BalnceEnvelope<T>;
}

export function upgradeLegacyEnvelope(legacy: any): BalnceEnvelope {
  // Map v1 fields to v2
  return createEnvelope({
    id: legacy.id,
    traceId: legacy.traceId,
    runId: legacy.runId,
    lane: legacy.lane || "agent_stream",
    source: legacy.source || { type: "system", id: "legacy-bridge" },
    event: legacy.event || { type: "legacy.event" },
    delivery: legacy.delivery || { class: "ephemeral" },
    payload: legacy.payload,
    instruction: legacy.instruction,
    context: legacy.context,
    policy: legacy.policy,
    provenance: legacy.provenance,
  });
}

export function validateEnvelope(envelope: any): envelope is BalnceEnvelope {
  return !!(
    envelope &&
    envelope.protocol === "balnce.fabric" &&
    envelope.version === "0.2.0" &&
    typeof envelope.id === "string" &&
    typeof envelope.lane === "string" &&
    envelope.source &&
    envelope.event &&
    envelope.delivery
  );
}
