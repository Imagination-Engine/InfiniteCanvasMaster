import EventEmitter from "eventemitter3";
import type { BalnceEnvelope } from "../envelope.js";
import type {
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "../transport.js";

export class InProcessTransport implements FabricTransport {
  readonly id = "local-in-process";
  readonly kind = "in-process";
  private emitter = new EventEmitter();

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

  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    const hasExplicitTopics = filter.topics !== undefined;
    const lanes = filter.lanes ?? [];
    // Lane-only filters subscribe on lane channels; publish emits on both topic
    // and lane, so also registering the default "#" topic would double-invoke.
    const useLaneChannels = lanes.length > 0 && !hasExplicitTopics;
    const topics = hasExplicitTopics
      ? filter.topics!
      : useLaneChannels
        ? []
        : ["#"];

    const wrappedHandler = (envelope: BalnceEnvelope<T>) => {
      if (lanes.length > 0 && !lanes.includes(envelope.lane)) return;
      if (filter.traceId && filter.traceId !== envelope.traceId) return;
      if (filter.runId && filter.runId !== envelope.runId) return;
      if (filter.eventTypes && !filter.eventTypes.includes(envelope.event.type))
        return;

      return handler(envelope);
    };

    if (useLaneChannels) {
      for (const lane of lanes) {
        this.emitter.on(`lane:${lane}`, wrappedHandler);
      }
    } else {
      for (const topic of topics) {
        this.emitter.on(topic, wrappedHandler);
      }
    }

    const unsubscribe: FabricUnsubscribe = () => {
      if (useLaneChannels) {
        for (const lane of lanes) {
          this.emitter.off(`lane:${lane}`, wrappedHandler);
        }
      } else {
        for (const topic of topics) {
          this.emitter.off(topic, wrappedHandler);
        }
      }
    };

    return Promise.resolve(unsubscribe);
  }
}
