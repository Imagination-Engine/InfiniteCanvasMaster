import type { BalnceEnvelope } from "./envelope";
import {
  FabricRouter,
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "./transport";

export class BalnceFabricRouter implements FabricRouter {
  private transports: Map<string, FabricTransport> = new Map();
  private laneMap: Map<string, string[]> = new Map();

  constructor(defaultTransport: FabricTransport) {
    this.registerTransport(defaultTransport);
    // By default, all lanes route to the default transport
  }

  registerTransport(transport: FabricTransport, lanes?: string[]) {
    this.transports.set(transport.id, transport);
    if (lanes) {
      lanes.forEach((lane) => {
        const current = this.laneMap.get(lane) || [];
        this.laneMap.set(lane, [...current, transport.id]);
      });
    }
  }

  async publish<T>(envelope: BalnceEnvelope<T>): Promise<void> {
    const transportIds =
      this.laneMap.get(envelope.lane) || Array.from(this.transports.keys());

    const targets = transportIds
      .map((id) => this.transports.get(id))
      .filter(Boolean) as FabricTransport[];

    await Promise.all(targets.map((t) => t.publish(envelope)));
  }

  async subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    // For now, subscribe to all transports that handle these lanes
    const transportIds = filter.lanes
      ? Array.from(
          new Set(
            filter.lanes.flatMap(
              (lane) =>
                this.laneMap.get(lane) || Array.from(this.transports.keys()),
            ),
          ),
        )
      : Array.from(this.transports.keys());

    const unsubscribes = await Promise.all(
      transportIds
        .map((id) => this.transports.get(id))
        .filter(Boolean)
        .map((t) => t!.subscribe(filter, handler)),
    );

    return async () => {
      await Promise.all(unsubscribes.map((u) => u()));
    };
  }
}
