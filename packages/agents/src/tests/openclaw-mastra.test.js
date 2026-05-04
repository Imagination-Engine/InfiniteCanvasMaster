import { describe, it, expect, vi } from "vitest";
import { createOpenClawTaskTool } from "../tools/openclaw/taskTool";
describe("OpenClawMastraTool (TaskTool)", () => {
  it("should create a Mastra tool that routes to the OpenClawBlockAdapter", async () => {
    const mockStartTask = vi
      .fn()
      .mockResolvedValue({ taskId: "t-1", status: "started" });
    // Mock the adapter
    const mockAdapter = {
      startTask: mockStartTask,
    };
    const tool = createOpenClawTaskTool(mockAdapter);
    expect(tool.id).toBe("openclaw_task_executor");
    expect(tool.description).toContain(
      "Execute a task within a specific OpenClaw Agent Block",
    );
    // Execute the tool (Mastra tools typically expect the raw args or {context})
    const result = await tool.execute({
      blockId: "block-alpha",
      sessionId: "sess-1",
      task: "Analyze this image",
      requireApproval: true,
    });
    expect(mockStartTask).toHaveBeenCalledWith(
      "block-alpha",
      "sess-1",
      "Analyze this image",
      expect.objectContaining({ requireHumanApprovalForShell: true }),
    );
    expect(result.taskId).toBe("t-1");
    expect(result.status).toBe("started");
  });
  it("should return a failed status if adapter throws", async () => {
    const mockStartTask = vi
      .fn()
      .mockRejectedValue(new Error("Connection lost"));
    const mockAdapter = {
      startTask: mockStartTask,
    };
    const tool = createOpenClawTaskTool(mockAdapter);
    const result = await tool.execute({
      blockId: "block-beta",
      sessionId: "sess-2",
      task: "Do something dangerous",
    });
    expect(result.status).toBe("failed");
    expect(result.summary).toContain("Connection lost");
  });
});
