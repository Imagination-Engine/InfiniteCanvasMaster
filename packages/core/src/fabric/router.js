export class BalnceFabricRouter {
  transports = new Map();
  laneMap = new Map();
  constructor(defaultTransport) {
    this.registerTransport(defaultTransport);
    // By default, all lanes route to the default transport
  }
  registerTransport(transport, lanes) {
    this.transports.set(transport.id, transport);
    if (lanes) {
      lanes.forEach((lane) => {
        const current = this.laneMap.get(lane) || [];
        this.laneMap.set(lane, [...current, transport.id]);
      });
    }
  }
  async publish(envelope) {
    const transportIds =
      this.laneMap.get(envelope.lane) || Array.from(this.transports.keys());
    const targets = transportIds
      .map((id) => this.transports.get(id))
      .filter(Boolean);
    await Promise.all(targets.map((t) => t.publish(envelope)));
  }
  async subscribe(filter, handler) {
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
        .map((t) => t.subscribe(filter, handler)),
    );
    return async () => {
      await Promise.all(unsubscribes.map((u) => u()));
    };
  }
}
