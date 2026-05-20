/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const canvasState = vi.hoisted(() => ({
  objects: {} as Record<string, unknown>,
}));
const selectionState = vi.hoisted(() => ({
  selectedIds: [] as string[],
}));

vi.mock("../../state/canvasStore", () => ({
  useCanvasStore: (selector: (s: typeof canvasState) => unknown) =>
    selector(canvasState),
}));

vi.mock("../../state/selectionStore", () => ({
  useSelectionStore: (selector: (s: typeof selectionState) => unknown) =>
    selector(selectionState),
}));

vi.mock("../../state/shellStore", () => ({
  useShellStore: (selector: (s: { sessionContext: string }) => unknown) =>
    selector({ sessionContext: "test-session" }),
}));

import { useOrchestratorContext } from "../useOrchestratorContext";

describe("useOrchestratorContext hook", () => {
  beforeEach(() => {
    canvasState.objects = {};
    selectionState.selectedIds = [];
  });

  it("should return the currently selected block ID", () => {
    selectionState.selectedIds = ["block-1"];
    const { result } = renderHook(() => useOrchestratorContext());
    expect(result.current.selectedBlockId).toBe("block-1");
  });

  it("should return details of the selected block", () => {
    canvasState.objects = {
      "block-1": {
        id: "block-1",
        type: "note",
        metadata: { label: "Test Note" },
      },
    };
    selectionState.selectedIds = ["block-1"];

    const { result } = renderHook(() => useOrchestratorContext());
    expect(result.current.selectedBlock?.metadata?.label).toBe("Test Note");
  });

  it("should track the last added block as a recent drop", () => {
    const { result, rerender } = renderHook(() => useOrchestratorContext());

    act(() => {
      canvasState.objects = {
        "block-new": { id: "block-new", type: "agent" },
      };
    });
    rerender();

    expect(result.current.lastDroppedBlockId).toBe("block-new");
  });

  it("should attach compatible blocks when a studio block is selected", () => {
    canvasState.objects = {
      "writer-1": {
        id: "writer-1",
        type: "iem.studio.writer",
        blockKind: "iem.studio.writer",
        metadata: {},
      },
    };
    selectionState.selectedIds = ["writer-1"];

    const { result } = renderHook(() => useOrchestratorContext());
    expect(result.current.blockContext?.blockId).toBe("iem.studio.writer");
    expect(result.current.compatibleBlocks.length).toBeGreaterThan(0);
    expect(result.current.studioCapabilitySummary).toContain("Writer");
  });
});
