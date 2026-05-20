import type { BalnceEnvelope } from "./envelope";
import {
  FabricRouter,
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "./transport";
export declare class BalnceFabricRouter implements FabricRouter {
  private transports;
  private laneMap;
  constructor(defaultTransport: FabricTransport);
  registerTransport(transport: FabricTransport, lanes?: string[]): void;
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
}
//# sourceMappingURL=router.d.ts.map
