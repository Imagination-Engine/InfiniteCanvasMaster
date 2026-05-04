// @ts-nocheck
import { describe, it, expect } from "vitest";
import { createEnvelope, validateEnvelope } from "../envelope";

describe("Envelope v2 Schema (Slice 1)", () => {
  it("should enforce lane and delivery class", () => {
    const env = createEnvelope({
      lane: "agent_stream",
      source: { type: "agent", id: "a1" },
      event: { type: "test" },
      delivery: { class: "ephemeral" },
      payload: { foo: "bar" },
    });

    expect(env.lane).toBe("agent_stream");
    expect(env.delivery.class).toBe("ephemeral");
    expect(validateEnvelope(env)).toBe(true);
  });

  it("should include protocol and version by default", () => {
    const env = createEnvelope({
      lane: "workflow_trace",
      source: { type: "workflow", id: "w1" },
      event: { type: "start" },
      delivery: { class: "ephemeral" },
      payload: {},
    });
    expect(env.protocol).toBe("balnce.fabric");
    expect(env.version).toBe("0.2.0");
  });
});
