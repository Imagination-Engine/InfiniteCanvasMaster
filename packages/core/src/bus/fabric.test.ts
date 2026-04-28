import { describe, it, expect, vi } from "vitest";
import { LocalEventEmitterTransport } from "./transport";
import { CoreMessageFabric } from "./fabric";
import { BALNCE_A2A_PROTOCOL, BALNCE_A2A_VERSION } from "./protocol";

describe("A2A Message Fabric Infrastructure", () => {
  const mockEnvelope = {
    protocol: BALNCE_A2A_PROTOCOL,
    version: BALNCE_A2A_VERSION,
    id: "msg-1",
    traceId: "trace-1",
    runId: "run-1",
    source: { type: "system", id: "test" },
    event: {
      type: "node.output",
      sequence: 1,
      timestamp: new Date().toISOString(),
    },
    payload: { data: "test" },
  } as any;

  describe("LocalEventEmitterTransport", () => {
    it("should publish and subscribe to messages", async () => {
      const transport = new LocalEventEmitterTransport();
      const handler = vi.fn();

      transport.subscribe("test.topic", handler);
      await transport.publish("test.topic", mockEnvelope);

      expect(handler).toHaveBeenCalledWith(mockEnvelope);
    });

    it("should unsubscribe correctly", async () => {
      const transport = new LocalEventEmitterTransport();
      const handler = vi.fn();

      const { unsubscribe } = transport.subscribe("test.topic", handler);
      unsubscribe();

      await transport.publish("test.topic", mockEnvelope);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("CoreMessageFabric", () => {
    it("should delegate to transport and handle envelopes", async () => {
      const transport = new LocalEventEmitterTransport();
      const fabric = new CoreMessageFabric(transport);
      const handler = vi.fn();

      fabric.subscribe("fabric.topic", handler);
      await fabric.publish("fabric.topic", mockEnvelope);

      expect(handler).toHaveBeenCalledWith(mockEnvelope);
    });
  });
});
