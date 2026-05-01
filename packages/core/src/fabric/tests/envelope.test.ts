import { describe, it, expect } from "vitest";
import {
  createEnvelope,
  validateEnvelope,
  upgradeLegacyEnvelope,
} from "../envelope";

describe("Envelope v2", () => {
  it("should create a valid v2 envelope", () => {
    const env = createEnvelope({
      lane: "agent_stream",
      source: { type: "agent", id: "a1" },
      event: { type: "test" },
      delivery: { class: "ephemeral" },
      payload: { foo: "bar" },
    });

    expect(env.protocol).toBe("balnce.fabric");
    expect(env.version).toBe("0.2.0");
    expect(env.lane).toBe("agent_stream");
    expect(validateEnvelope(env)).toBe(true);
  });

  it("should upgrade legacy envelopes", () => {
    const legacy = {
      id: "old-1",
      traceId: "t1",
      payload: "data",
    };

    const upgraded = upgradeLegacyEnvelope(legacy);
    expect(upgraded.version).toBe("0.2.0");
    expect(upgraded.id).toBe("old-1");
    expect(upgraded.lane).toBe("agent_stream");
  });
});
