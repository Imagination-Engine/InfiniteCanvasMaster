import EventEmitter from "eventemitter3";
export class InProcessTransport {
  id = "local-in-process";
  kind = "in-process";
  emitter = new EventEmitter();
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
  subscribe(filter, handler) {
    const hasExplicitTopics = filter.topics !== undefined;
    const lanes = filter.lanes ?? [];
    // Lane-only filters subscribe on lane channels; publish emits on both topic
    // and lane, so also registering the default "#" topic would double-invoke.
    const useLaneChannels = lanes.length > 0 && !hasExplicitTopics;
    const topics = hasExplicitTopics
      ? filter.topics
      : useLaneChannels
        ? []
        : ["#"];
    const wrappedHandler = (envelope) => {
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
    const unsubscribe = () => {
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
