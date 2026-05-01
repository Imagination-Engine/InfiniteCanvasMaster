import type { BalnceEnvelope } from "./envelope";
import type {
  FabricHandler,
  FabricSubscriptionFilter,
  FabricTransport,
  FabricUnsubscribe,
} from "./transport";

export interface FabricRouterOptions {
  transports: FabricTransport[];
}

export class FabricRouter {
  private readonly transports: FabricTransport[];

  constructor(options: FabricRouterOptions) {
    this.transports = options.transports;
  }

  async publish<T>(envelope: BalnceEnvelope<T>): Promise<void> {
    const transports = await this.route(envelope);
    await Promise.all(
      transports.map((transport) => transport.publish(envelope)),
    );
  }

  async subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    const unsubs = await Promise.all(
      this.transports.map((transport) => transport.subscribe(filter, handler)),
    );
    return async () => {
      await Promise.all(unsubs.map((unsub) => unsub()));
    };
  }

  async route<T>(envelope: BalnceEnvelope<T>): Promise<FabricTransport[]> {
    // Implementation agents must replace this minimal candidate selection with
    // lane + delivery + policy aware routing according to the spec.
    return this.transports.filter(
      (transport) =>
        !transport.supports ||
        transport.supports({
          lane: envelope.lane,
          deliveryClass: envelope.delivery.class,
        }),
    );
  }
}
