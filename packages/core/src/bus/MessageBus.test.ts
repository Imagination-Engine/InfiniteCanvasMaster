import { describe, it, expect, vi } from "vitest";
import { messageBus } from "./MessageBus";
import {
  wrapInEnvelope,
  BALNCE_A2A_PROTOCOL,
  BALNCE_A2A_VERSION,
  Topics,
} from "./protocol";

describe("MessageBus (Fabric) & BalnceEnvelope", () => {
  it("should wrap payloads correctly into a protocol-compliant envelope", () => {
    const envelope = wrapInEnvelope({
      traceId: "test-run",
      source: { type: "block", id: "block-a" },
      context: { foo: "bar" },
      payload: { hello: "world" },
    });

    expect(envelope.protocol).toBe(BALNCE_A2A_PROTOCOL);
    expect(envelope.version).toBe(BALNCE_A2A_VERSION);
    expect(envelope.id).toBeDefined();
    expect(envelope.traceId).toBe("test-run");
    expect(envelope.payload.hello).toBe("world");
  });

  it("should publish and subscribe to specific topics using typed envelopes", async () => {
    const callback = vi.fn();
    const topic = Topics.dagNodeOutput("test-run", "block-a");
    const { unsubscribe } = messageBus.subscribe(topic, callback);

    const envelope = wrapInEnvelope({
      traceId: "test-run",
      runId: "test-run",
      source: { type: "block", id: "block-a" },
      payload: { result: 42 },
    });

    await messageBus.publish(topic, envelope);

    expect(callback).toHaveBeenCalledTimes(1);
    const received = callback.mock.calls[0][0];
    expect(received.payload.result).toBe(42);
    expect(received.protocol).toBe(BALNCE_A2A_PROTOCOL);

    unsubscribe();
    await messageBus.publish(topic, envelope);
    expect(callback).toHaveBeenCalledTimes(1); // Should not increase
  });

  it("adversarial: should handle unexpected payload types without crashing", async () => {
    const callback = vi.fn();
    const { unsubscribe } = messageBus.subscribe("dag.adversarial", callback);

    // Publish something that isn't a valid envelope - policy engine or transport should handle it
    // In our current simple implementation, it just passes through or might fail schema validation if we added it to publish.
    await messageBus.publish("dag.adversarial", { something: "else" } as any);

    expect(callback).toHaveBeenCalled();
    unsubscribe();
  });
});
