import { EventEmitter } from "events";
import { BalnceEnvelope } from "../envelope";
import {
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "../transport";

export class InProcessTransport implements FabricTransport {
  readonly id = "local-in-process";
  readonly kind = "in-process";
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(1000);
  }

  async publish<T>(envelope: BalnceEnvelope<T>): Promise<void> {
    const topic = envelope.source?.topic || "global";

    // Exact topic
    this.emitter.emit(topic, envelope);

    // Wildcard support (hierarchical)
    const parts = topic.split(".");
    for (let i = 0; i < parts.length; i++) {
      const wildcardTopic = [
        ...parts.slice(0, i),
        "*",
        ...parts.slice(i + 1),
      ].join(".");
      this.emitter.emit(wildcardTopic, envelope);
    }

    // Multi-level wildcard
    this.emitter.emit("#", envelope);

    // Lane-specific emission
    this.emitter.emit(`lane:${envelope.lane}`, envelope);
  }

  async subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    const topics = filter.topics || ["#"];

    const wrappedHandler = (envelope: BalnceEnvelope<T>) => {
      // Filter logic
      if (filter.lanes && !filter.lanes.includes(envelope.lane)) return;
      if (filter.traceId && filter.traceId !== envelope.traceId) return;
      if (filter.runId && filter.runId !== envelope.runId) return;
      if (filter.eventTypes && !filter.eventTypes.includes(envelope.event.type))
        return;

      return handler(envelope);
    };

    for (const topic of topics) {
      this.emitter.on(topic, wrappedHandler);
    }

    if (filter.lanes) {
      for (const lane of filter.lanes) {
        this.emitter.on(`lane:${lane}`, wrappedHandler);
      }
    }

    return () => {
      for (const topic of topics) {
        this.emitter.off(topic, wrappedHandler);
      }
      if (filter.lanes) {
        for (const lane of filter.lanes) {
          this.emitter.off(`lane:${lane}`, wrappedHandler);
        }
      }
    };
  }
}
