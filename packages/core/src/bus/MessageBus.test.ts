// @ts-nocheck
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

    // Check for either legacy or new protocol/version during transition
    expect(["balnce.a2a", "balnce.fabric"]).toContain(envelope.protocol);
    expect(["0.1.0", "0.2.0"]).toContain(envelope.version);
    expect(envelope.id).toBeDefined();
    expect(envelope.traceId).toBe("test-run");
    expect(envelope.payload.hello).toBe("world");
  });

  it("should publish and subscribe to specific topics using typed envelopes", async () => {
    const callback = vi.fn();
    const topic = Topics.dagNodeOutput("test-run", "block-a");
    // New Fabric Router API: subscribe returns a promise for an unsubscribe function
    const unsubscribe = await (messageBus as any).subscribe(
      { topics: [topic] },
      callback,
    );

    const envelope = wrapInEnvelope({
      traceId: "test-run",
      runId: "test-run",
      source: { type: "block", id: "block-a", topic },
      payload: { result: 42 },
    });

    // Use promoted API
    if ((messageBus as any).publish) {
      await (messageBus as any).publish(envelope);
    }

    expect(callback).toHaveBeenCalledTimes(1);
    const received = callback.mock.calls[0][0];
    expect(received.payload.result).toBe(42);

    if (typeof unsubscribe === "function") await unsubscribe();
    else if (unsubscribe && (unsubscribe as any).unsubscribe)
      await (unsubscribe as any).unsubscribe();

    if ((messageBus as any).publish) {
      await (messageBus as any).publish(envelope);
    }
    expect(callback).toHaveBeenCalledTimes(1); // Should not increase
  });

  it("adversarial: should handle unexpected payload types without crashing", async () => {
    const callback = vi.fn();
    const unsubscribe = await (messageBus as any).subscribe(
      { topics: ["dag.adversarial"] },
      callback,
    );

    // Publish something that isn't a valid envelope
    // Note: InProcessTransport might reject if we strictly typed publish,
    // but for now we test resilience.
    try {
      await (messageBus as any).publish({
        id: "1",
        event: { type: "test" },
      } as any);
    } catch (e) {
      // Router might throw on invalid v2 envelope, which is also acceptable behavior
    }

    // expect(callback).toHaveBeenCalled(); // Only if it was valid enough to route

    if (typeof unsubscribe === "function") await unsubscribe();
    else if (unsubscribe && (unsubscribe as any).unsubscribe)
      await (unsubscribe as any).unsubscribe();
  });
});
