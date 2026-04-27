import { describe, it, expect, vi } from "vitest";
import { createOpenClawWorkflowStep } from "../tools/openclaw/workflowStep";
import { OpenClawBlockAdapter } from "@iem/imagination-canvas-kit";

describe("OpenClaw Workflow Step", () => {
  it("should execute task immediately if no approval is required", async () => {
    const mockStartTask = vi
      .fn()
      .mockResolvedValue({ taskId: "t-1", status: "completed" });
    const mockAdapter = {
      startTask: mockStartTask,
    } as unknown as OpenClawBlockAdapter;

    const step = createOpenClawWorkflowStep(mockAdapter);
    const suspendMock = vi.fn();

    const result = await step.execute({
      context: {
        blockId: "block-1",
        sessionId: "sess-1",
        task: "safe task",
      },
      suspend: suspendMock,
      getStepResult: () => null,
      getInitData: () => null,
      mastra: {} as any,
    } as any);

    expect(mockStartTask).toHaveBeenCalledWith(
      "block-1",
      "sess-1",
      "safe task",
      undefined,
    );
    expect(suspendMock).not.toHaveBeenCalled();
    expect(result.status).toBe("completed");
    expect(result.approved).toBe(true);
  });

  it("should suspend and wait for human approval when policy is triggered", async () => {
    const mockStartTask = vi.fn().mockResolvedValue({
      taskId: "t-2",
      requestId: "req-99",
      status: "waiting_for_approval",
    });
    const mockApproveAction = vi.fn().mockResolvedValue(undefined);

    const mockAdapter = {
      startTask: mockStartTask,
      approveAction: mockApproveAction,
    } as unknown as OpenClawBlockAdapter;

    const step = createOpenClawWorkflowStep(mockAdapter);

    // Simulate user approving the suspension
    const suspendMock = vi.fn().mockResolvedValue({
      approved: true,
      requestId: "req-99",
    });

    const result = await step.execute({
      context: {
        blockId: "block-2",
        sessionId: "sess-2",
        task: "dangerous task",
      },
      suspend: suspendMock,
      getStepResult: () => null,
      getInitData: () => null,
      mastra: {} as any,
    } as any);

    expect(suspendMock).toHaveBeenCalled();
    expect(mockApproveAction).toHaveBeenCalledWith("block-2", "req-99");
    expect(result.status).toBe("resumed");
    expect(result.approved).toBe(true);
  });

  it("should throw if human denies the suspended task", async () => {
    const mockStartTask = vi.fn().mockResolvedValue({
      taskId: "t-3",
      requestId: "req-100",
      status: "waiting_for_approval",
    });
    const mockDenyAction = vi.fn().mockResolvedValue(undefined);

    const mockAdapter = {
      startTask: mockStartTask,
      denyAction: mockDenyAction,
    } as unknown as OpenClawBlockAdapter;

    const step = createOpenClawWorkflowStep(mockAdapter);

    // Simulate user denying
    const suspendMock = vi.fn().mockResolvedValue({
      approved: false,
      requestId: "req-100",
    });

    await expect(
      step.execute({
        context: {
          blockId: "block-3",
          sessionId: "sess-3",
          task: "dangerous task 2",
        },
        suspend: suspendMock,
        getStepResult: () => null,
        getInitData: () => null,
        mastra: {} as any,
      } as any),
    ).rejects.toThrow("Human denied the OpenClaw task execution.");

    expect(mockDenyAction).toHaveBeenCalledWith("block-3", "req-100");
  });
});
