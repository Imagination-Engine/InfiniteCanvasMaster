import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@mastra/pg", () => {
  class MockPostgresStore {
    init = vi.fn().mockResolvedValue(undefined);
    __setLogger = vi.fn();
    constructor(public readonly options: Record<string, unknown>) {}
  }
  return { PostgresStore: MockPostgresStore };
});

import { Mastra } from "@mastra/core";
import { PostgresStore } from "@mastra/pg";

describe("Mastra Brain Initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with a postgres store adapter (no live DB in unit tests)", async () => {
    const store = new PostgresStore({
      id: "iem-storage",
      connectionString: "postgres://localhost:5433/imagination_canvas",
    });

    const mastra = new Mastra({
      storage: store,
      agents: {},
    });

    expect(mastra).toBeDefined();
    expect(store.options).toEqual({
      id: "iem-storage",
      connectionString: "postgres://localhost:5433/imagination_canvas",
    });
  });
});
