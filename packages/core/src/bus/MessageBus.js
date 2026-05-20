// @ts-nocheck
import { InProcessTransport } from "../fabric/transports/InProcessTransport";
import { BalnceFabricRouter } from "../fabric/router";
import { upgradeLegacyEnvelope } from "../fabric/envelope";
// Initialize the promoted Fabric architecture
export const localTransport = new InProcessTransport();
export const fabricRouter = new BalnceFabricRouter(localTransport);
// Export fabricRouter as messageBus for compatibility (but promoting it conceptually)
export const messageBus = fabricRouter;
// Backward compatibility for anything expecting the old MessageBus interface
// which had publish(topic, string) and subscribe(topic, callback)
export const legacyMessageBus = {
  publish: (topic, message) => {
    try {
      const parsed = JSON.parse(message);
      // Map legacy publish to v2 envelope
      const envelope = upgradeLegacyEnvelope({
        ...parsed,
        source: { ...parsed.source, topic },
      });
      messageBus.publish(envelope);
    } catch (e) {
      console.error("[FABRIC] Failed to parse legacy publish message", e);
    }
  },
  subscribe: (topic, callback) => {
    // Map legacy subscribe to v2 filter
    const unsubscribePromise = messageBus.subscribe(
      { topics: [topic] },
      (envelope) => {
        callback(envelope);
      },
    );
    // Legacy unsubscribe was synchronous, new is async promise
    return () => {
      unsubscribePromise.then((u) => u());
    };
  },
};
