// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOpenClawGroupControl } from "../hooks/useOpenClawGroupControl";
import { useCanvasStore } from "../state/canvasStore";

vi.mock("../state/canvasStore");

describe("useOpenClawGroupControl", () => {
  it("should initialize a group task and set status to planning", async () => {
    const mockUpdateObject = vi.fn();
    (useCanvasStore as any).mockImplementation((selector: any) => {
      if (
        selector.name.includes("updateObject") ||
        selector.toString().includes("updateObject")
      ) {
        return mockUpdateObject;
      }
      return {
        metadata: {
          id: "group-1",
          state: { status: "idle" },
        },
      };
    });

    const { result } = renderHook(() => useOpenClawGroupControl("group-1"));

    await act(async () => {
      await result.current.startGroupTask("Analyze market data");
    });

    expect(mockUpdateObject).toHaveBeenCalledWith(
      "group-1",
      expect.objectContaining({
        metadata: expect.objectContaining({
          state: expect.objectContaining({ status: "planning" }),
          task: expect.objectContaining({ userIntent: "Analyze market data" }),
        }),
      }),
    );
  });

  it("should assign a subtask to a block ID", async () => {
    const mockUpdateObject = vi.fn();
    (useCanvasStore as any).mockImplementation((selector: any) => {
      if (
        selector.name.includes("updateObject") ||
        selector.toString().includes("updateObject")
      ) {
        return mockUpdateObject;
      }
      return {
        metadata: {
          task: {
            subtasks: [{ subtaskId: "st-1", status: "unassigned" }],
          },
        },
      };
    });

    const { result } = renderHook(() => useOpenClawGroupControl("group-1"));

    await act(async () => {
      await result.current.assignSubtask("st-1", "block-x");
    });

    const callArgs = mockUpdateObject.mock.calls[0][1];
    expect(callArgs.metadata.task.subtasks[0].assignedBlockId).toBe("block-x");
    expect(callArgs.metadata.task.subtasks[0].status).toBe("assigned");
  });
});
