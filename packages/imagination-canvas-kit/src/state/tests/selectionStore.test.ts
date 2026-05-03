/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "../selectionStore";

describe("Selection Store", () => {
  beforeEach(() => {
    useSelectionStore.setState({
      selectedIds: [],
      hoveredId: null,
      selectionMode: "none",
    });
  });

  it("should initialize with default state", () => {
    const state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual([]);
    expect(state.hoveredId).toBeNull();
    expect(state.selectionMode).toBe("none");
  });

  it("should set single selection", () => {
    const { select } = useSelectionStore.getState();
    select("obj-1");

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual(["obj-1"]);
    expect(state.selectionMode).toBe("single");
  });

  it("should replace selection when selecting another object without additive flag", () => {
    const { select } = useSelectionStore.getState();
    select("obj-1");
    select("obj-2");

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual(["obj-2"]);
    expect(state.selectionMode).toBe("single");
  });

  it("should add to selection when additive flag is true", () => {
    const { select } = useSelectionStore.getState();
    select("obj-1");
    select("obj-2", { additive: true });

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toContain("obj-1");
    expect(state.selectedIds).toContain("obj-2");
    expect(state.selectedIds).toHaveLength(2);
    expect(state.selectionMode).toBe("multi");
  });

  it("should toggle selection when toggle flag is true", () => {
    const { select } = useSelectionStore.getState();
    select("obj-1");
    select("obj-1", { toggle: true });

    let state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual([]);
    expect(state.selectionMode).toBe("none");

    select("obj-2", { toggle: true });
    state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual(["obj-2"]);
    expect(state.selectionMode).toBe("single");
  });

  it("should clear selection", () => {
    const { select, clearSelection } = useSelectionStore.getState();
    select("obj-1");
    select("obj-2", { additive: true });
    clearSelection();

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual([]);
    expect(state.selectionMode).toBe("none");
  });

  it("should set hovered id", () => {
    const { setHovered } = useSelectionStore.getState();
    setHovered("obj-1");

    const state = useSelectionStore.getState();
    expect(state.hoveredId).toBe("obj-1");
  });

  it("should set selection mode explicitly", () => {
    const { setSelectionMode } = useSelectionStore.getState();
    setSelectionMode("region");

    const state = useSelectionStore.getState();
    expect(state.selectionMode).toBe("region");
  });

  it("should update selection mode correctly when using setSelection", () => {
    const { setSelection } = useSelectionStore.getState();
    setSelection(["obj-1", "obj-2", "obj-3"]);

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toHaveLength(3);
    expect(state.selectionMode).toBe("multi");
  });

  it("should not add duplicate IDs with additive: true", () => {
    const { select } = useSelectionStore.getState();
    select("obj-1");
    select("obj-1", { additive: true });

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual(["obj-1"]);
    expect(state.selectionMode).toBe("single");
  });

  it("should handle clearing selection mode when clearing selection", () => {
    const { setSelectionMode, clearSelection } = useSelectionStore.getState();
    setSelectionMode("region");
    clearSelection();

    const state = useSelectionStore.getState();
    expect(state.selectionMode).toBe("none");
  });

  it("should select objects in a rect", () => {
    const { selectInRect } = useSelectionStore.getState();
    const objects = [
      { id: "obj-1", x: 0, y: 0, width: 50, height: 50 },
      { id: "obj-2", x: 100, y: 100, width: 50, height: 50 },
    ];
    const marquee = { x: -10, y: -10, width: 60, height: 60 };

    selectInRect(marquee, objects);

    const state = useSelectionStore.getState();
    expect(state.selectedIds).toEqual(["obj-1"]);
    expect(state.selectionMode).toBe("single");
  });
});
