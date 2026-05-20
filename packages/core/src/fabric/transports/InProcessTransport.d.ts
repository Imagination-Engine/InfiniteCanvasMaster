import type { BalnceEnvelope } from "../envelope";
import {
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "../transport";
export declare class InProcessTransport implements FabricTransport {
  readonly id = "local-in-process";
  readonly kind = "in-process";
  private emitter;
  constructor();
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
}
//# sourceMappingURL=InProcessTransport.d.ts.map
