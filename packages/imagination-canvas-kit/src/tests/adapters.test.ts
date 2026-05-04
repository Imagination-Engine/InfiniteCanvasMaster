// @ts-nocheck
import { describe, it, expect } from "vitest";
import { NoRuntimeOpenClawAdapter } from "../adapters/openclaw/NoRuntimeAdapter";
import { TestOpenClawAdapter } from "../adapters/openclaw/TestAdapter";
import { OpenClawBlockPolicy } from "../contracts/openclaw";

describe("OpenClaw Adapters", () => {
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

  describe("NoRuntimeOpenClawAdapter", () => {
    const adapter = new NoRuntimeOpenClawAdapter();

    it("should return a degraded runtime status", async () => {
      const status = await adapter.getRuntimeStatus("block-1");
      expect(status.connectionStatus).toBe("disconnected");
      expect(status.error).toContain("degraded mode");
    });

    it("should return empty arrays for skills and tools", async () => {
      expect(await adapter.listSkills("block-1")).toEqual([]);
      expect(await adapter.listTools("block-1")).toEqual([]);
      expect(await adapter.getOutputs("block-1")).toEqual([]);
    });

    it("should throw on any execution attempts", async () => {
      await expect(
        adapter.createSession("block-1", dummyPolicy),
      ).rejects.toThrow("No runtime available");
      await expect(
        adapter.startTask("block-1", "sess-1", "do work", dummyPolicy),
      ).rejects.toThrow("No runtime available");
    });

    it("should yield a single error event on stream", async () => {
      const stream = adapter.streamEvents("block-1");
      const iterator = stream[Symbol.asyncIterator]();
      const firstEvent = await iterator.next();

      expect(firstEvent.value.type).toBe("openclaw.runtime.error");
      expect(firstEvent.done).toBe(false);

      const secondEvent = await iterator.next();
      expect(secondEvent.done).toBe(true);
    });
  });

  describe("TestOpenClawAdapter", () => {
    const adapter = new TestOpenClawAdapter();

    it("should return a connected runtime status", async () => {
      const status = await adapter.getRuntimeStatus("block-2");
      expect(status.connectionStatus).toBe("connected");
      expect(status.environment).toBe("local");
    });

    it("should allow session creation and binding", async () => {
      const session = await adapter.createSession("block-2", dummyPolicy);
      expect(session.sessionId).toContain("sess-");

      const binding = await adapter.bindSession("block-2", session.sessionId);
      expect(binding.connectionStatus).toBe("connected");
      expect(binding.sessionId).toBe(session.sessionId);
    });

    it("should return mock skills and tools", async () => {
      const skills = await adapter.listSkills("block-2");
      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0].id).toBe("test-skill");

      const tools = await adapter.listTools("block-2");
      expect(tools.length).toBeGreaterThan(0);
      expect(tools[0].id).toBe("test-tool");
    });

    it("should allow starting a mock task", async () => {
      const task = await adapter.startTask(
        "block-2",
        "sess-1",
        "test prompt",
        dummyPolicy,
      );
      expect(task.taskId).toContain("task-");
      expect(task.status).toBe("running");
    });
  });
});
