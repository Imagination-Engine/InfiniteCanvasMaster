import { LocalEventEmitterTransport } from "./transport";
import { CoreMessageFabric } from "./fabric";
import { BasicPolicyEngine } from "./policy";
import { InMemoryEventLog } from "./log";

// Initialize the default local production fabric
export const localTransport = new LocalEventEmitterTransport();
export const localPolicyEngine = new BasicPolicyEngine();
export const localEventLog = new InMemoryEventLog();

export const messageBus = new CoreMessageFabric(
  localTransport,
  localPolicyEngine,
  localEventLog,
);

// Backward compatibility for anything expecting the old MessageBus interface
// which had publish(topic, string) and subscribe(topic, callback)
export const legacyMessageBus = {
  publish: (topic: string, message: string) => {
    try {
      const parsed = JSON.parse(message);
      messageBus.publish(topic, parsed);
    } catch (e) {
      console.error("[A2A] Failed to parse legacy publish message", e);
    }
  },
  subscribe: (topic: string, callback: (message: any) => void) => {
    return messageBus.subscribe(topic, (envelope) => {
      callback(envelope);
    }).unsubscribe;
  },
};
