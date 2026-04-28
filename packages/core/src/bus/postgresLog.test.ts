import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostgresEventLog } from "./postgresLog";
import { BalnceEnvelope } from "./protocol";

// Mock DB
const mockInsert = vi.fn().mockReturnThis();
const mockValues = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnThis();
const mockWhere = vi.fn().mockReturnThis();
const mockOrderBy = vi.fn().mockResolvedValue([]);

vi.mock("@iem/db", () => ({
  db: {
    insert: () => ({ values: mockInsert }),
    select: () => ({
      from: () => ({ where: () => ({ orderBy: mockOrderBy }) }),
    }),
    delete: vi.fn(),
  },
  a2aEventLogs: {
    traceId: "traceId",
    runId: "runId",
    sourceId: "sourceId",
    eventType: "eventType",
    timestamp: "timestamp",
  },
}));

describe("PostgresEventLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEnvelope = (deliveryClass: any): BalnceEnvelope =>
    ({
      protocol: "balnce.a2a",
      version: "0.1.0",
      id: "msg-1",
      traceId: "trace-1",
      runId: "run-1",
      source: { type: "agent", id: "test" },
      event: {
        type: "node.output",
        sequence: 1,
        timestamp: new Date().toISOString(),
      },
      payload: { data: "test" },
      delivery: { class: deliveryClass },
    }) as any;

  it("should NOT append ephemeral envelopes", async () => {
    const log = new PostgresEventLog();
    await log.append(mockEnvelope("ephemeral"));
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("should append durable envelopes", async () => {
    const log = new PostgresEventLog();
    await log.append(mockEnvelope("durable"));
    expect(mockInsert).toHaveBeenCalled();
  });

  it("should append replayable envelopes", async () => {
    const log = new PostgresEventLog();
    await log.append(mockEnvelope("replayable"));
    expect(mockInsert).toHaveBeenCalled();
  });
});
