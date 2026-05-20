import { describe, it, expect, vi } from "vitest";
import { InProcessTransport } from "../transports/InProcessTransport.js";
import type { BalnceEnvelope } from "../envelope.js";

describe("InProcessTransport", () => {
  const mockEnvelope: BalnceEnvelope = {
    protocol: "balnce.fabric",
    version: "0.2.0",
    id: "msg-1",
    traceId: "trace-1",
    lane: "agent_stream",
    source: { type: "agent", id: "agent-1", topic: "agent.1.stream" },
    event: { type: "token", timestamp: new Date().toISOString() },
    delivery: { class: "ephemeral" },
    payload: "hello",
  };

  it("subscribe returns a Promise that resolves to an unsubscribe function", async () => {
    const transport = new InProcessTransport();
    const handler = vi.fn();

    const result = transport.subscribe({ topics: ["#"] }, handler);
    expect(result).toBeInstanceOf(Promise);

    const unsubscribe = await result;
    expect(typeof unsubscribe).toBe("function");

    await transport.publish(mockEnvelope);
    expect(handler).toHaveBeenCalledWith(mockEnvelope);

    await unsubscribe();
    handler.mockClear();
    await transport.publish(mockEnvelope);
    expect(handler).not.toHaveBeenCalled();
  });

  it("invokes lane-only subscribers once per publish", async () => {
    const transport = new InProcessTransport();
    const handler = vi.fn();

    const unsubscribe = await transport.subscribe(
      { lanes: ["agent_stream"] },
      handler,
    );

    await transport.publish(mockEnvelope);
    expect(handler).toHaveBeenCalledTimes(1);

    await unsubscribe();
  });

  it("invokes topic subscribers once when topics and lanes are both set", async () => {
    const transport = new InProcessTransport();
    const handler = vi.fn();

    const unsubscribe = await transport.subscribe(
      { topics: ["#"], lanes: ["agent_stream"] },
      handler,
    );

    await transport.publish(mockEnvelope);
    expect(handler).toHaveBeenCalledTimes(1);

    await unsubscribe();
  });
});
