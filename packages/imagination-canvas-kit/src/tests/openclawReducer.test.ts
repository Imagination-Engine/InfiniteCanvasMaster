// @ts-nocheck
import { describe, it, expect } from "vitest";
import { openclawBlockReducer } from "../state/openclawReducer";
import { OpenClawBlock, OpenClawBlockEvent } from "../contracts/openclaw";

describe("openclawBlockReducer", () => {
  const baseBlock: OpenClawBlock = {
    id: "block-1",
    type: "openclaw.block",
    title: "Test Block",
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    zIndex: 1,
    state: { status: "ready" },
    runtime: { environment: "local", connectionStatus: "connected" },
    capabilities: {} as any,
    policy: {} as any,
    bindings: {},
    ui: {
      displayMode: "compact",
      selected: false,
      locked: false,
      collapsed: false,
      showDebugTrace: false,
      showProvenance: false,
      showSecurityPanel: false,
      showCostPanel: false,
    },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    schemaVersion: 1,
  };

  it("should handle openclaw.task.started", () => {
    const event: OpenClawBlockEvent = {
      type: "openclaw.task.started",
      blockId: "block-1",
      taskId: "task-123",
      timestamp: "2026-01-01T00:00:01Z",
    };

    const nextState = openclawBlockReducer(baseBlock, event);
    expect(nextState.state.status).toBe("running");
    expect(nextState.state.currentTaskId).toBe("task-123");
    expect(nextState.state.progress).toBe(0);
  });

  it("should handle openclaw.task.progress", () => {
    const runningBlock = {
      ...baseBlock,
      state: {
        ...baseBlock.state,
        status: "running" as const,
        currentTaskId: "task-123",
      },
    };
    const event: OpenClawBlockEvent = {
      type: "openclaw.task.progress",
      blockId: "block-1",
      taskId: "task-123",
      message: "Analyzing data...",
      progress: 45,
      timestamp: "2026-01-01T00:00:02Z",
    };

    const nextState = openclawBlockReducer(runningBlock, event);
    expect(nextState.state.progress).toBe(45);
    expect(nextState.state.currentTask).toBe("Analyzing data...");
  });

  it("should handle openclaw.approval.required", () => {
    const runningBlock = {
      ...baseBlock,
      state: { ...baseBlock.state, status: "running" as const },
    };
    const event: OpenClawBlockEvent = {
      type: "openclaw.approval.required",
      blockId: "block-1",
      request: {
        requestId: "req-1",
        blockId: "block-1",
        actionType: "shell",
        title: "Run cmd",
        summary: "ls",
        riskLevel: "high",
        requestedBy: "openclaw",
        createdAt: "2026-01-01T00:00:03Z",
      },
      timestamp: "2026-01-01T00:00:03Z",
    };

    const nextState = openclawBlockReducer(runningBlock, event);
    expect(nextState.state.status).toBe("waiting_for_approval");
  });
});
