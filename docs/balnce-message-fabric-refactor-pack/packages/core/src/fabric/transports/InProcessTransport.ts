import { EventEmitter } from "node:events";
import type { BalnceEnvelope } from "../envelope";
import type {
  FabricHandler,
  FabricSubscriptionFilter,
  FabricTransport,
  FabricUnsubscribe,
} from "../transport";

export class InProcessTransport implements FabricTransport {
  readonly id = "in_process";
  readonly kind = "in_process";
  private readonly emitter = new EventEmitter();

  async publish<T>(envelope: BalnceEnvelope<T>): Promise<void> {
    this.emitter.emit("*", envelope);
    this.emitter.emit(envelope.lane, envelope);
    if (envelope.target?.topic)
      this.emitter.emit(envelope.target.topic, envelope);
  }

  async subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    const eventNames = filter.topics?.length
      ? filter.topics
      : filter.lanes?.length
        ? filter.lanes
        : ["*"];
    const wrapped = (envelope: BalnceEnvelope<T>) => {
      if (filter.traceId && envelope.traceId !== filter.traceId) return;
      if (filter.runId && envelope.runId !== filter.runId) return;
      if (filter.eventTypes && !filter.eventTypes.includes(envelope.event.type))
        return;
      void handler(envelope);
    };
    for (const name of eventNames) this.emitter.on(name, wrapped);
    return () => {
      for (const name of eventNames) this.emitter.off(name, wrapped);
    };
  }

  supports(): boolean {
    return true;
  }
}
