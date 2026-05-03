/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBlockAutosave } from "../useBlockAutosave";
import { useCanvasStore } from "../../state/canvasStore";
import { useSelectionStore } from "../../state/selectionStore";
import { renderHook, act } from "@testing-library/react";

describe("useBlockAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });
    useSelectionStore.setState({ editingId: null });

    useCanvasStore.getState().addObject({
      id: "block-1",
      type: "block",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      status: "idle",
      data: { content: "initial" },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should debounce updates to the canvasStore", () => {
    const { result } = renderHook(() => useBlockAutosave("block-1"));
    const { updateData } = result.current;

    act(() => {
      updateData({ content: "updated" });
    });

    // Before timer, store should not be updated
    let obj = useCanvasStore
      .getState()
      .objects.find((o) => o.id === "block-1") as any;
    expect(obj.data.content).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(500); // Fast-forward time
    });

    // After timer, store should be updated
    obj = useCanvasStore
      .getState()
      .objects.find((o) => o.id === "block-1") as any;
    expect(obj.data.content).toBe("updated");
  });

  it("should reject agent mutations if the block is currently locked for user editing", () => {
    // Lock the block
    useSelectionStore.getState().setEditing("block-1");

    const { result } = renderHook(() => useBlockAutosave("block-1"));
    const { applyAgentMutation } = result.current;

    act(() => {
      // Simulate an incoming agent event
      const success = applyAgentMutation({ content: "agent edit" });
      expect(success).toBe(false);
    });

    // Ensure it wasn't queued/updated
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const obj = useCanvasStore
      .getState()
      .objects.find((o) => o.id === "block-1") as any;
    expect(obj.data.content).toBe("initial");
  });

  describe("adversarial cases", () => {
    it("should clear old timeouts when called rapidly", () => {
      const { result } = renderHook(() => useBlockAutosave("block-1"));
      const { updateData } = result.current;

      act(() => {
        updateData({ content: "1" });
        updateData({ content: "2" });
        updateData({ content: "3" });
      });

      // Fire timer halfway
      act(() => {
        vi.advanceTimersByTime(200);
      });

      let obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "block-1") as any;
      expect(obj.data.content).toBe("initial");

      // Finish timer
      act(() => {
        vi.advanceTimersByTime(200);
      });

      obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "block-1") as any;
      expect(obj.data.content).toBe("3");
    });

    it("should handle updates to non-existent blocks safely", () => {
      const { result } = renderHook(() => useBlockAutosave("ghost-block"));
      const { updateData, applyAgentMutation } = result.current;

      expect(() => {
        act(() => {
          updateData({ content: "spooky" });
          vi.advanceTimersByTime(500);
        });
      }).not.toThrow();

      let success;
      act(() => {
        success = applyAgentMutation({ content: "ghost edit" });
      });
      expect(success).toBe(false);
    });
  });
});
