// @ts-nocheck
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

    it("should emit approval.required event for the UI", async () => {
      const transport = new LocalEventEmitterTransport();
      const fabric = new CoreMessageFabric(transport);
      const uiHandler = vi.fn();

      const approvalEnvelope = {
        ...mockEnvelope,
        id: "approval-3",
        runId: "run-3",
        delivery: { class: "approval_required" },
      };

      // Subscribe to approval event topic
      fabric.subscribe("approval.run-3.event", uiHandler);
      await fabric.publish("fabric.topic", approvalEnvelope);

      expect(uiHandler).toHaveBeenCalled();
      const notification = uiHandler.mock.calls[0][0];
      expect(notification.event.type).toBe("approval.required");
      expect(notification.payload.originalEnvelopeId).toBe("approval-3");
    });

    it("adversarial: should ignore approval.granted for unknown envelopes", async () => {
      const transport = new LocalEventEmitterTransport();
      const fabric = new CoreMessageFabric(transport);

      const grantEnvelope = {
        protocol: BALNCE_A2A_PROTOCOL,
        version: BALNCE_A2A_VERSION,
        id: "grant-fake",
        traceId: "trace-fake",
        runId: "run-fake",
        source: { type: "user", id: "user-1" },
        event: {
          type: "approval.granted",
          sequence: 0,
          timestamp: new Date().toISOString(),
        },
        payload: { originalEnvelopeId: "non-existent" },
      };

      // Should not throw or crash
      await expect(
        fabric.publish("approval.run-fake.event", grantEnvelope as any),
      ).resolves.not.toThrow();
    });
  });
});
