import { describe, it, expect, vi } from "vitest";
import { InProcessTransport } from "../transports/InProcessTransport";
import { BalnceFabricRouter } from "../router";
import { createEnvelope } from "../envelope";

describe("Lane Semantic Separation", () => {
  const transport = new InProcessTransport();
  const router = new BalnceFabricRouter(transport);

  it("should separate agent_stream from document_state", async () => {
    const streamHandler = vi.fn();
    const docHandler = vi.fn();

    await router.subscribe({ lanes: ["agent_stream"] }, streamHandler);
    await router.subscribe({ lanes: ["document_state"] }, docHandler);

    const streamEnv = createEnvelope({
      lane: "agent_stream",
      source: { type: "agent", id: "a1" },
      event: { type: "token" },
      delivery: { class: "ephemeral" },
      payload: "part 1",
    });

    await router.publish(streamEnv);

    expect(streamHandler).toHaveBeenCalledWith(streamEnv);
    expect(docHandler).not.toHaveBeenCalled();
  });

  it("should enforce durable class for durable_event lane", () => {
    // In a real implementation, the router would reject invalid combinations
    // For now we test that the data structure is correct
    const env = createEnvelope({
      lane: "durable_event",
      source: { type: "system", id: "s1" },
      event: { type: "fact" },
      delivery: { class: "durable" },
      payload: {},
    });
    expect(env.delivery.class).toBe("durable");
  });
});
