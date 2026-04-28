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
    this.emitter.emit(topic, envelope);
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
