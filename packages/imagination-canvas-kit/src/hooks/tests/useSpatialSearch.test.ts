// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useSpatialSearch } from "../useSpatialSearch";
import { useCanvasStore } from "../../state/canvasStore";
import { renderHook, act } from "@testing-library/react";

describe("useSpatialSearch", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });

    useCanvasStore.getState().addObject({
      id: "agent-1",
      type: "block",
      blockKind: "agent",
      data: { role: "Architect" },
      metadata: { department: "Engineering" },
    } as any);

    useCanvasStore.getState().addObject({
      id: "note-1",
      type: "block",
      blockKind: "note",
      data: { content: "Need to build the new spatial search feature." },
    } as any);

    useCanvasStore.getState().addObject({
      id: "note-2",
      type: "block",
      blockKind: "note",
      data: { content: "Nothing interesting here." },
    } as any);
  });

  it("should find objects matching text in their data content", () => {
    const { result } = renderHook(() => useSpatialSearch());
    const { search } = result.current;

    let matches: string[] = [];
    act(() => {
      matches = search("spatial search");
    });

    expect(matches).toContain("note-1");
    expect(matches).not.toContain("note-2");
  });

  it("should find objects matching metadata", () => {
    const { result } = renderHook(() => useSpatialSearch());
    const { search } = result.current;

    let matches: string[] = [];
    act(() => {
      matches = search("Engineering");
    });

    expect(matches).toContain("agent-1");
  });

  it("should be case-insensitive", () => {
    const { result } = renderHook(() => useSpatialSearch());
    const { search } = result.current;

    let matches: string[] = [];
    act(() => {
      matches = search("architect");
    });

    expect(matches).toContain("agent-1");
  });

  describe("adversarial cases", () => {
    it("should handle empty or whitespace queries by returning empty array", () => {
      const { result } = renderHook(() => useSpatialSearch());
      const { search } = result.current;

      expect(search("")).toEqual([]);
      expect(search("   ")).toEqual([]);
    });

    it("should not crash on objects missing data or metadata fields", () => {
      useCanvasStore.getState().addObject({
        id: "empty-obj",
        type: "shape",
        shapeType: "circle",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        status: "idle",
      } as any);

      const { result } = renderHook(() => useSpatialSearch());
      const { search } = result.current;

      let matches: string[] = [];
      act(() => {
        // Will match 'shape' from the obj type
        matches = search("shape");
      });

      expect(matches).toContain("empty-obj");
    });
  });
});
