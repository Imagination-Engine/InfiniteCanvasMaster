import type { BalnceEnvelope } from "../envelope.js";
import type {
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "../transport.js";
export declare class InProcessTransport implements FabricTransport {
  readonly id = "local-in-process";
  readonly kind = "in-process";
  private emitter;
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
}
//# sourceMappingURL=InProcessTransport.d.ts.map
