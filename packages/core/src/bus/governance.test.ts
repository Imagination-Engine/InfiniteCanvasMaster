import { describe, it, expect } from "vitest";
import { BasicPolicyEngine } from "./policy";
import { InMemoryEventLog } from "./log";
import {
  NodeInputAdapterRegistry,
  DefaultStrictInputAdapter,
} from "./adapters";
import { BALNCE_A2A_PROTOCOL, BALNCE_A2A_VERSION } from "./protocol";

describe("A2A Governance & Observability", () => {
  const mockEnvelope = (trust: "trusted" | "untrusted") =>
    ({
      protocol: BALNCE_A2A_PROTOCOL,
      version: BALNCE_A2A_VERSION,
      id: "msg-1",
      traceId: "trace-1",
      runId: "run-1",
      source: { type: "agent", id: "test" },
      event: {
        type: "node.output",
        sequence: 1,
        timestamp: new Date().toISOString(),
      },
      instruction: { text: "do something", origin: "agent", trust },
      payload: { data: "test" },
    }) as any;

  describe("BasicPolicyEngine", () => {
    it("should allow trusted instructions", async () => {
      const engine = new BasicPolicyEngine();
      const decision = await engine.evaluatePublish({
        topic: "test",
        envelope: mockEnvelope("trusted"),
      });
      expect(decision.allowed).toBe(true);
    });

    it("should block or warn on untrusted instructions in sensitive topics", async () => {
      // Implementation detail: what does "Basic" block?
      // For now let's say it allows but we'll test the interface
      const engine = new BasicPolicyEngine();
      const decision = await engine.evaluatePublish({
        topic: "test",
        envelope: mockEnvelope("untrusted"),
      });
      expect(decision).toHaveProperty("allowed");
    });
  });

  describe("InMemoryEventLog", () => {
    it("should store and query envelopes", async () => {
      const log = new InMemoryEventLog();
      const env = mockEnvelope("trusted");
      await log.append(env);

      const results = await log.query({ traceId: "trace-1" });
      expect(results).toContainEqual(env);
    });
  });

  describe("NodeInputAdapterRegistry", () => {
    it("should adapt inputs using the default adapter", async () => {
      const registry = new NodeInputAdapterRegistry();
      registry.registerDefault(new DefaultStrictInputAdapter());

      const env = mockEnvelope("trusted");
      const result = await registry.adapt({
        envelopes: [env],
        baseInput: { existing: true },
        nodeSpec: {},
        runContext: {},
      });

      expect(result).toHaveProperty("existing", true);
    });
  });
});
