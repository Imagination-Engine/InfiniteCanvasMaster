import { EventEmitter } from "events";
import { A2AMessageTransport, BalnceEnvelope } from "./protocol";

export class LocalEventEmitterTransport implements A2AMessageTransport {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(1000);
  }

  async publish<TPayload>(
    topic: string,
    envelope: BalnceEnvelope<TPayload>,
  ): Promise<void> {
    // Emit to the exact topic
    this.emitter.emit(topic, envelope);

    // Emit to wildcard topics (e.g., if someone subscribed to "dag.*.event", and we publish "dag.123.event")
    const parts = topic.split(".");
    for (let i = 0; i < parts.length; i++) {
      const wildcardTopic = [
        ...parts.slice(0, i),
        "*",
        ...parts.slice(i + 1),
      ].join(".");
      this.emitter.emit(wildcardTopic, envelope);
    }

    // Support multi-level wildcard if needed (e.g., #)
    this.emitter.emit("#", envelope);
  }

  subscribe<TPayload>(
    topic: string,
    handler: (envelope: BalnceEnvelope<TPayload>) => void | Promise<void>,
  ): { unsubscribe: () => void } {
    this.emitter.on(topic, handler);
    return {
      unsubscribe: () => {
        this.emitter.off(topic, handler);
      },
    };
  }

  async close(): Promise<void> {
    this.emitter.removeAllListeners();
  }
}
