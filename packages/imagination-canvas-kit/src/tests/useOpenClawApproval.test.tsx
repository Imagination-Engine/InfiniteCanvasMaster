// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOpenClawApproval } from "../hooks/useOpenClawApproval";
import { useOpenClawAdapter } from "../adapters/openclaw/OpenClawAdapterProvider";
import { useCanvasStore } from "../state/canvasStore";

vi.mock("../adapters/openclaw/OpenClawAdapterProvider");
vi.mock("../state/canvasStore");

describe("useOpenClawApproval", () => {
  const mockApprove = vi.fn().mockResolvedValue(undefined);
  const mockDeny = vi.fn().mockResolvedValue(undefined);
  const mockUpdateObject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOpenClawAdapter as any).mockReturnValue({
      approveAction: mockApprove,
      denyAction: mockDeny,
    });

    (useCanvasStore as any).mockImplementation((selector: any) => {
      // If the selector is `s => s.updateObject`, return the mock function
      if (
        selector.name.includes("updateObject") ||
        selector.toString().includes("updateObject")
      ) {
        return mockUpdateObject;
      }

      // Default state for resolving the block and queue
      const mockState = {
        objects: {
          "block-1": {
            metadata: {
              state: {
                status: "waiting_for_approval",
                approvalQueue: [
                  {
                    requestId: "req-1",
                    actionType: "shell",
                    title: "Run Command",
                  },
                ],
              },
            },
          },
        },
      };
      return selector(mockState);
    });
  });

  it("should expose the pending approval queue from the block metadata", () => {
    const { result } = renderHook(() => useOpenClawApproval("block-1"));
    expect(result.current.queue.length).toBe(1);
    expect(result.current.queue[0].requestId).toBe("req-1");
  });

  it("should call adapter.approveAction and clear the queue item", async () => {
    const { result } = renderHook(() => useOpenClawApproval("block-1"));

    await act(async () => {
      await result.current.approve("req-1");
    });

    expect(mockApprove).toHaveBeenCalledWith("block-1", "req-1");
    expect(mockUpdateObject).toHaveBeenCalled();
    // Verify the state patch removed the item
    const updateCall = mockUpdateObject.mock.calls[0];
    expect(updateCall[0]).toBe("block-1");
    expect(updateCall[1].metadata.state.approvalQueue).toEqual([]);
    expect(result.current.isProcessing).toBe(false);
  });

  it("should call adapter.denyAction and clear the queue item", async () => {
    const { result } = renderHook(() => useOpenClawApproval("block-1"));

    await act(async () => {
      await result.current.deny("req-1");
    });

    expect(mockDeny).toHaveBeenCalledWith("block-1", "req-1");
    expect(mockUpdateObject).toHaveBeenCalled();
  });
});
