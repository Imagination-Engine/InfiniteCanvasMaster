export type FabricDeliveryClass =
  | "ephemeral"
  | "replayable"
  | "durable"
  | "approval_required"
  | "provenance_required"
  | "realtime_low_latency";

export type FabricOrdering = "none" | "per_topic" | "causal" | "strict";

export interface FabricDelivery {
  class: FabricDeliveryClass;
  ordering?: FabricOrdering;
  replayable?: boolean;
  durable?: boolean;
  ttlMs?: number;
  idempotencyKey?: string;
}
