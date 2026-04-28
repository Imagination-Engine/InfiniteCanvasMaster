import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabasePolicyEngine } from "./databasePolicy";
import { BalnceEnvelope } from "./protocol";

// Mock DB
const mockSelect = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnThis();
const mockWhere = vi.fn();

vi.mock("@iem/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: mockWhere }) }),
  },
  customAgents: { id: "id" },
}));

describe("DatabasePolicyEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEnvelope = (agentId: string, caps: string[] = []): BalnceEnvelope =>
    ({
      protocol: "balnce.a2a",
      version: "0.1.0",
      id: "msg-1",
      traceId: "trace-1",
      runId: "run-1",
      source: { type: "agent", id: agentId },
      event: {
        type: "node.output",
        sequence: 1,
        timestamp: new Date().toISOString(),
      },
      payload: { data: "test" },
      policy: { visibility: "workspace", allowedCapabilities: caps },
    }) as any;

  it("should block agents missing required capabilities", async () => {
    // Mock agent in DB WITHOUT capabilities
    mockWhere.mockResolvedValueOnce([{ id: "agent-1", capabilities: [] }]);

    const engine = new DatabasePolicyEngine();
    const decision = await engine.evaluatePublish({
      topic: "test",
      envelope: mockEnvelope("agent-1", ["filesystem_write"]),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("missing required capability");
  });

  it("should allow agents with required capabilities", async () => {
    // Mock agent in DB WITH capabilities
    mockWhere.mockResolvedValueOnce([
      { id: "agent-1", capabilities: ["filesystem_write"] },
    ]);

    const engine = new DatabasePolicyEngine();
    const decision = await engine.evaluatePublish({
      topic: "test",
      envelope: mockEnvelope("agent-1", ["filesystem_write"]),
    });

    expect(decision.allowed).toBe(true);
  });

  it("should redact payloads when policy.redaction is set", async () => {
    const engine = new DatabasePolicyEngine();
    const env = {
      ...mockEnvelope("user-1"),
      payload: { secret: "1234", nested: { key: "val" } },
      policy: { redaction: "compact" },
    };

    const decision = await engine.evaluatePublish({
      topic: "test",
      envelope: env as any,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.modifiedEnvelope?.payload.secret).toBe("[REDACTED]");
    expect(decision.modifiedEnvelope?.payload.nested.key).toBe("[REDACTED]");
  });
});
