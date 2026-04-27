import { EventEmitter } from "events";

export interface MessageBus {
  publish(topic: string, message: string): void;
  subscribe(topic: string, callback: (message: any) => void): () => void;
}

class LocalMessageBus implements MessageBus {
  private emitter = new EventEmitter();

  constructor() {
    // Increase limit for DAG edge density
    this.emitter.setMaxListeners(100);
  }

  publish(topic: string, message: string): void {
    this.emitter.emit(topic, message);
  }

  subscribe(topic: string, callback: (message: any) => void): () => void {
    const wrappedCallback = (message: string) => {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (err) {
        console.error(
          `[MessageBus] Failed to parse message on topic ${topic}`,
          err,
        );
      }
    };

    this.emitter.on(topic, wrappedCallback);

    return () => {
      this.emitter.off(topic, wrappedCallback);
    };
  }
}

export const messageBus = new LocalMessageBus();
