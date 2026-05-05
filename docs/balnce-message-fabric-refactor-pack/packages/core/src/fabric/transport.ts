import type { BalnceEnvelope } from "./envelope";
import type { BalnceFabricLane } from "./lanes";
import type { FabricDeliveryClass } from "./delivery";

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
