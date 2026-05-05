// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "../selectionStore";
import { useViewportStore } from "../viewportStore";

describe("Editing State Isolation", () => {
  beforeEach(() => {
    useSelectionStore.setState({ editingId: null });
    useViewportStore.setState({ x: 0, y: 0, zoom: 1 });
  });

  it("should track editing state in selection store", () => {
    const { setEditing } = useSelectionStore.getState() as any;
    setEditing("obj-1");

    expect((useSelectionStore.getState() as any).editingId).toBe("obj-1");

    setEditing(null);
    expect((useSelectionStore.getState() as any).editingId).toBeNull();
  });

  it("should prevent viewport pan when editing is active", () => {
    const { setEditing } = useSelectionStore.getState() as any;
    setEditing("obj-1");

    const { pan } = useViewportStore.getState() as any;
    // We expect pan to do nothing if an object is being edited, to prevent accidental navigation
    pan(50, 50);

    const state = useViewportStore.getState();
    expect(state.x).toBe(0);
    expect(state.y).toBe(0);
  });

  it("should prevent viewport zoom when editing is active", () => {
    const { setEditing } = useSelectionStore.getState() as any;
    setEditing("obj-1");

    const { setCamera } = useViewportStore.getState() as any;
    setCamera({ x: 0, y: 0, zoom: 2 });

    const state = useViewportStore.getState();
    expect(state.zoom).toBe(1);
  });

  it("should clear editing state when selection is cleared", () => {
    const { setEditing, clearSelection } = useSelectionStore.getState() as any;
    setEditing("obj-1");
    clearSelection();

    expect((useSelectionStore.getState() as any).editingId).toBeNull();
  });
});
