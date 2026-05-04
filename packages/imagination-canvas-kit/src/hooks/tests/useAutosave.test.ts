// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAutosave } from "../useAutosave";
import { useCanvasStore } from "../../state/canvasStore";
import { renderHook, act } from "@testing-library/react";

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should start idle and debounce mutations before syncing", () => {
    const { result } = renderHook(() => useAutosave());

    expect(result.current.syncStatus).toBe("saved");

    act(() => {
      useCanvasStore.getState().addObject({ id: "obj-1" } as any);
    });

    // We might need to manually trigger sync based on the implementation,
    // but assuming useAutosave hooks into state changes
    act(() => {
      result.current.triggerAutosave();
    });

    expect(result.current.syncStatus).toBe("saving");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.syncStatus).toBe("saved");
  });
});
