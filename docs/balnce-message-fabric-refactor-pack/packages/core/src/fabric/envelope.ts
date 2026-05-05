import type { BalnceFabricLane } from "./lanes";
import type { FabricDelivery } from "./delivery";

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
  payload: TPayload;
}
