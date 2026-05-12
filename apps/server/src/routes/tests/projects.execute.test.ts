import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { projectsRouter } from "../projects.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: () => ({ sub: "user-1" }),
  },
}));

const mockStart = vi.fn();
vi.mock("@iem/agents", () => ({
  compileGraphToWorkflow: vi.fn(() => ({
    createRun: vi.fn(async () => ({
      runId: "r1",
      start: mockStart,
    })),
  })),
  mastra: {},
}));

describe("Projects Router /:id/execute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeApp(db: any) {
    const app = new Hono();
    app.use("*", async (c, next) => {
      c.set("db", db);
      return next();
    });
    app.route("/", projectsRouter);
    return app;
  }

  it("returns 403 when workspace not owned", async () => {
    const db = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: "p1", ownerId: "someone-else" }]),
    };
    const app = makeApp(db);

    const res = await app.request("/p1/execute", {
      method: "POST",
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document: { nodes: [], edges: [] },
        triggerData: {},
      }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("executes a compiled workflow", async () => {
    const db = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: "p1", ownerId: "user-1" }]),
    };
    const app = makeApp(db);
    mockStart.mockResolvedValueOnce({
      status: "success",
      result: { ok: true },
      steps: {},
    });

    const res = await app.request("/p1/execute", {
      method: "POST",
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document: {
          nodes: [
            { id: "a", type: "iem.core.summarizer", data: { inputs: {} } },
          ],
          edges: [],
        },
        triggerData: { foo: "bar" },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.runId).toBe("r1");
    expect(mockStart).toHaveBeenCalledTimes(1);
  });
});
