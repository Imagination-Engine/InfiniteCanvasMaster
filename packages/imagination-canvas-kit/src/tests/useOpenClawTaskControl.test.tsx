/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOpenClawTaskControl } from "../hooks/useOpenClawTaskControl";
import { useOpenClawAdapter } from "../adapters/openclaw/OpenClawAdapterProvider";
import { useCanvasStore } from "../state/canvasStore";

vi.mock("../adapters/openclaw/OpenClawAdapterProvider");
vi.mock("../state/canvasStore");

describe("useOpenClawTaskControl", () => {
  it("should call adapter.startTask when start is invoked", async () => {
    const mockStartTask = vi
      .fn()
      .mockResolvedValue({ taskId: "new-task-1", status: "running" });
    const mockAdapter = { startTask: mockStartTask };

    (useOpenClawAdapter as any).mockReturnValue(mockAdapter);

    // Fix: the hook uses `useCanvasStore(s => s.objects[blockId])`
    // so we need to return the object when the selector is called
    (useCanvasStore as any).mockImplementation((selector: any) => {
      const mockState = {
        objects: {
          "block-1": {
            metadata: {
              runtime: { sessionId: "sess-1" },
              policy: { sandboxMode: "strict" },
            },
          },
        },
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useOpenClawTaskControl("block-1"));

    await act(async () => {
      await result.current.start("Process this data");
    });

    expect(mockStartTask).toHaveBeenCalledWith(
      "block-1",
      "sess-1",
      "Process this data",
      { sandboxMode: "strict" },
    );
    expect(result.current.isStarting).toBe(false);
  });

  it("should call adapter.pauseTask when pause is invoked", async () => {
    const mockPauseTask = vi.fn().mockResolvedValue(undefined);
    const mockAdapter = { pauseTask: mockPauseTask };

    (useOpenClawAdapter as any).mockReturnValue(mockAdapter);

    (useCanvasStore as any).mockImplementation((selector: any) => {
      const mockState = {
        objects: {
          "block-1": {
            metadata: {
              state: { currentTaskId: "task-123" },
            },
          },
        },
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useOpenClawTaskControl("block-1"));

    await act(async () => {
      await result.current.pause();
    });

    expect(mockPauseTask).toHaveBeenCalledWith("block-1", "task-123");
  });
});
