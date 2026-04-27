import { describe, it, expect, vi } from "vitest";
import { messageBus } from "./MessageBus";
import { wrapInEnvelope, serializeEnvelope } from "./protocol";

describe("MessageBus & BalnceEnvelope", () => {
  it("should wrap payloads correctly into an NDJSON envelope", () => {
    const envelope = wrapInEnvelope({
      traceId: "test-run",
      sourceId: "block-a",
      context: { foo: "bar" },
      payload: { hello: "world" },
    });

    expect(envelope.id).toBeDefined();
    expect(envelope.timestamp).toBeDefined();
    expect(envelope.traceId).toBe("test-run");
    expect(envelope.payload.hello).toBe("world");
  });

  it("should publish and subscribe to specific topics", () => {
    const callback = vi.fn();
    const unsubscribe = messageBus.subscribe("dag.test.block.a", callback);

    const envelope = wrapInEnvelope({
      traceId: "test",
      sourceId: "a",
      context: {},
      payload: { result: 42 },
    });

    messageBus.publish("dag.test.block.a", serializeEnvelope(envelope));

    expect(callback).toHaveBeenCalledTimes(1);
    const received = callback.mock.calls[0][0];
    expect(received.payload.result).toBe(42);

    unsubscribe();
    messageBus.publish("dag.test.block.a", serializeEnvelope(envelope));
    expect(callback).toHaveBeenCalledTimes(1); // Should not increase
  });

  it("adversarial: should safely handle malformed non-JSON messages without crashing", () => {
    const callback = vi.fn();
    const unsubscribe = messageBus.subscribe("dag.adversarial", callback);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Publish garbage
    messageBus.publish("dag.adversarial", "NOT_JSON_{{garbage}}");

    expect(callback).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[MessageBus] Failed to parse message"),
      expect.any(SyntaxError),
    );

    consoleSpy.mockRestore();
    unsubscribe();
  });
});
