import type { BalnceFabricLane } from "./lanes";
import type { BalnceEnvelope } from "./envelope";
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
export interface FabricTransport {
  readonly id: string;
  readonly kind: string;
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
}
export interface FabricRouter {
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
}
//# sourceMappingURL=transport.d.ts.map
