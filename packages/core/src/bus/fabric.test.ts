import { describe, it, expect, vi } from "vitest";
import { LocalEventEmitterTransport } from "./transport";
import { CoreMessageFabric } from "./fabric";
import { BALNCE_A2A_PROTOCOL, BALNCE_A2A_VERSION } from "./protocol";

vi.mock("@iem/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    }),
  },
  a2aApprovals: {
    envelopeId: { eq: vi.fn() },
  },
}));

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

    it("should pause delivery for approval_required class", async () => {
      const transport = new LocalEventEmitterTransport();
      const fabric = new CoreMessageFabric(transport);
      const handler = vi.fn();

      const approvalEnvelope = {
        ...mockEnvelope,
        id: "approval-1",
        delivery: { class: "approval_required" },
      };

      fabric.subscribe("fabric.topic", handler);
      await fabric.publish("fabric.topic", approvalEnvelope);

      // Should NOT have called the original handler yet
      expect(handler).not.toHaveBeenCalled();
    });

    it("should resume delivery after approval.granted", async () => {
      const transport = new LocalEventEmitterTransport();
      const fabric = new CoreMessageFabric(transport);
      const handler = vi.fn();

      const approvalEnvelope = {
        ...mockEnvelope,
        id: "approval-2",
        runId: "run-2",
        delivery: { class: "approval_required" },
      };

      fabric.subscribe("fabric.topic", handler);
      await fabric.publish("fabric.topic", approvalEnvelope);

      // Emit approval.granted
      const grantEnvelope = {
        protocol: BALNCE_A2A_PROTOCOL,
        version: BALNCE_A2A_VERSION,
        id: "grant-1",
        traceId: "trace-2",
        runId: "run-2",
        source: { type: "user", id: "user-1" },
        event: {
          type: "approval.granted",
          sequence: 0,
          timestamp: new Date().toISOString(),
        },
        payload: { originalEnvelopeId: "approval-2" },
      };

      // We need to publish the grant to the fabric so it can see it in its own subscriber
      await fabric.publish("approval.run-2.event", grantEnvelope as any);

      expect(handler).toHaveBeenCalledWith(approvalEnvelope);
    });

    it("should apply provenance signatures when provenance_required class is set", async () => {
      const transport = new LocalEventEmitterTransport();
      const fabric = new CoreMessageFabric(transport);
      const handler = vi.fn();

      const provenanceEnvelope = {
        ...mockEnvelope,
        id: "prov-1",
        delivery: { class: "provenance_required" },
      };

      fabric.subscribe("fabric.topic", handler);
      await fabric.publish("fabric.topic", provenanceEnvelope);

      expect(handler).toHaveBeenCalled();
      const received = handler.mock.calls[0][0];
      expect(received.provenance?.signature).toBeDefined();
    });
  });
});
