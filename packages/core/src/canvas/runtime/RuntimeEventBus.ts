type Handler<T = any> = (payload: T, eventType: string) => void;

interface Subscription {
  pattern: string;
  regex: RegExp;
  handler: Handler;
}

/**
 * High-performance wildcard event broker for synchronous canvas runtime signaling.
 */
class RuntimeEventBusBroker {
  private subscriptions: Set<Subscription> = new Set();

  /**
   * Publishes an event payload to all handlers matching the event pattern.
   */
  public publish<T>(eventType: string, payload: T): void {
    for (const sub of this.subscriptions) {
      if (sub.regex.test(eventType)) {
        try {
          sub.handler(payload, eventType);
        } catch (err) {
          console.error(
            `[EventBus] Error in handler for event "${eventType}":`,
            err,
          );
        }
      }
    }
  }

  /**
   * Subscribes to events matching a given pattern (supports wildcards e.g. "block.*" or "*").
   * Returns a function to unsubscribe.
   */
  public subscribe<T>(pattern: string, handler: Handler<T>): () => void {
    // Convert wildcard pattern to regular expression
    // e.g. "block.*" -> /^block\.[^.]+$/
    // e.g. "block.**" -> /^block\..+$/
    const escaped = pattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, "(.+)")
      .replace(/\*/g, "([^.]+)");
    const regex = new RegExp(`^${escaped}$`);

    const sub: Subscription = {
      pattern,
      regex,
      handler,
    };

    this.subscriptions.add(sub);

    return () => {
      this.subscriptions.delete(sub);
    };
  }

  /**
   * Resets all active subscriptions.
   */
  public clear(): void {
    this.subscriptions.clear();
  }
}

export const RuntimeEventBus = new RuntimeEventBusBroker();
