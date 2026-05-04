// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { InProcessTransport } from "../transports/InProcessTransport";
import { BalnceFabricRouter } from "../router";
import { BalnceEnvelope } from "../envelope";

describe("FabricRouter v1", () => {
  const transport = new InProcessTransport();
  const router = new BalnceFabricRouter(transport);

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

  it("should route agent_stream to in-process transport", async () => {
    const handler = vi.fn();
    await router.subscribe({ lanes: ["agent_stream"] }, handler);

    await router.publish(mockEnvelope);

    expect(handler).toHaveBeenCalledWith(mockEnvelope);
  });

  it("should filter by traceId", async () => {
    const handler = vi.fn();
    await router.subscribe({ traceId: "trace-2" }, handler);

    await router.publish(mockEnvelope);

    expect(handler).not.toHaveBeenCalled();
  });
});
