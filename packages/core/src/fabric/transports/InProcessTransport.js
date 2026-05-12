// @ts-nocheck
import EventEmitter from "eventemitter3";
export class InProcessTransport {
  id = "local-in-process";
  kind = "in-process";
  emitter = new EventEmitter();
  constructor() {}
  async publish(envelope) {
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
  async subscribe(filter, handler) {
    const topics = filter.topics || ["#"];
    const wrappedHandler = (envelope) => {
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
