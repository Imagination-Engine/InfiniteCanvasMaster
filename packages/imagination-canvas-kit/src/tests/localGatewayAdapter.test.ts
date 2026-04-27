import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalOpenClawGatewayAdapter } from "../adapters/openclaw/LocalGatewayAdapter";
import { OpenClawBlockPolicy } from "../contracts/openclaw";

describe("LocalOpenClawGatewayAdapter", () => {
  const dummyPolicy: OpenClawBlockPolicy = {
    sandboxMode: "strict",
    approvalRequiredFor: [],
    deniedTools: [],
    allowedTools: [],
    deniedSkills: [],
    allowedSkills: [],
    requireHumanApprovalForExternalMessages: true,
    requireHumanApprovalForFileWrites: true,
    requireHumanApprovalForShell: true,
    requireHumanApprovalForPurchases: true,
    requireHumanApprovalForCredentialAccess: true,
  };

  let adapter: LocalOpenClawGatewayAdapter;

  beforeEach(() => {
    // Reset fetch mocks before each test
    global.fetch = vi.fn();
    adapter = new LocalOpenClawGatewayAdapter("http://localhost:8080/api/v1");
  });

  it("should fetch runtime status successfully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "ok", version: "1.0.0" }),
    });

    const status = await adapter.getRuntimeStatus("block-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/health",
      expect.any(Object),
    );
    expect(status.connectionStatus).toBe("connected");
  });

  it("should gracefully handle runtime offline status", async () => {
    (global.fetch as any).mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );

    const status = await adapter.getRuntimeStatus("block-1");

    expect(status.connectionStatus).toBe("error");
    expect(status.error).toContain("fetch");
  });

  it("should create a session via the gateway", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session_id: "live-session-123" }),
    });

    const session = await adapter.createSession("block-1", dummyPolicy);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/sessions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("block-1"),
      }),
    );
    expect(session.sessionId).toBe("live-session-123");
  });

  it("should start a task via the gateway", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ task_id: "live-task-456", status: "running" }),
    });

    const result = await adapter.startTask(
      "block-1",
      "live-session-123",
      "analyze data",
      dummyPolicy,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/sessions/live-session-123/tasks",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("analyze data"),
      }),
    );
    expect(result.taskId).toBe("live-task-456");
  });

  it("should list skills from the gateway", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        skills: [
          {
            id: "python-runner",
            name: "Python Env",
            trusted: true,
            riskLevel: "high",
          },
        ],
      }),
    });

    const skills = await adapter.listSkills("block-1");
    expect(skills.length).toBe(1);
    expect(skills[0].id).toBe("python-runner");
  });
});
