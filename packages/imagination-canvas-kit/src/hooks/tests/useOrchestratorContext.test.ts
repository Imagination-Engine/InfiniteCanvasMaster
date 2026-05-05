/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrchestratorContext } from "../useOrchestratorContext";
import { useCanvasStore } from "../../state/canvasStore";
import { useSelectionStore } from "../../state/selectionStore";

describe("useOrchestratorContext hook", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: {} });
    useSelectionStore.setState({ selectedIds: [] });
  });

  it("should return the currently selected block ID", () => {
    const { result } = renderHook(() => useOrchestratorContext());

    act(() => {
      useSelectionStore.getState().select("block-1");
    });

    expect(result.current.selectedBlockId).toBe("block-1");
  });

  it("should return details of the selected block", () => {
    const testBlock = {
      id: "block-1",
      type: "note",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      metadata: { label: "Test Note" },
    };

    act(() => {
      useCanvasStore.getState().addObject(testBlock);
      useSelectionStore.getState().select("block-1");
    });

    const { result } = renderHook(() => useOrchestratorContext());
    expect(result.current.selectedBlock?.metadata?.label).toBe("Test Note");
  });

  it("should track the last added block as a recent drop", () => {
    const { result } = renderHook(() => useOrchestratorContext());

    const testBlock = {
      id: "block-new",
      type: "agent",
      x: 10,
      y: 10,
      width: 100,
      height: 100,
    };

    act(() => {
      useCanvasStore.getState().addObject(testBlock);
    });

    expect(result.current.lastDroppedBlockId).toBe("block-new");
  });
});
