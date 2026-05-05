// @ts-nocheck
import { describe, it, expect } from "vitest";
import {
  BalnceEnvelopeSchema,
  Topics,
  BALNCE_A2A_PROTOCOL,
  BALNCE_A2A_VERSION,
} from "./protocol";

describe("A2A Protocol & Topics", () => {
  describe("Topic Helpers", () => {
    it("should generate correct DAG topic strings", () => {
      expect(Topics.dagTrace("run-1")).toBe("dag.run-1.trace");
      expect(Topics.dagNodeOutput("run-1", "node-1")).toBe(
        "dag.run-1.node.node-1.output",
      );
    });

    it("should generate correct Canvas topic strings", () => {
      expect(Topics.canvasBlockEvent("canvas-1", "block-1")).toBe(
        "canvas.canvas-1.block.block-1.event",
      );
    });
  });

  describe("BalnceEnvelope Type & Schema", () => {
    it("should validate a complete compliant envelope", () => {
      const envelope = {
        protocol: BALNCE_A2A_PROTOCOL,
        version: BALNCE_A2A_VERSION,
        id: "msg-1",
        traceId: "trace-1",
        runId: "run-1",
        source: { type: "agent", id: "agent-1" },
        event: {
          type: "node.output",
          sequence: 1,
          timestamp: new Date().toISOString(),
        },
        payload: { result: "hello" },
      };

      const result = BalnceEnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should fail validation if protocol is missing or incorrect", () => {
      const envelope = {
        protocol: "wrong",
        version: BALNCE_A2A_VERSION,
        id: "msg-1",
        traceId: "trace-1",
        runId: "run-1",
        source: { type: "agent", id: "agent-1" },
        event: {
          type: "node.output",
          sequence: 1,
          timestamp: new Date().toISOString(),
        },
        payload: {},
      };

      const result = BalnceEnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(false);
    });
  });
});
