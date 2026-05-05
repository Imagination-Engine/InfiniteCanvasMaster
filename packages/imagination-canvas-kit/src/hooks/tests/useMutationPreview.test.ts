// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useMutationPreview } from "../useMutationPreview";
import { useCanvasStore } from "../../state/canvasStore";
import { renderHook, act } from "@testing-library/react";

describe("useMutationPreview", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: {}, connections: [], bindings: [] });

    useCanvasStore.getState().addObject({
      id: "obj-1",
      type: "shape",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      status: "idle",
      data: {},
    } as any);
  });

  it("should stage a mutation without affecting the main store", () => {
    const { result } = renderHook(() => useMutationPreview());
    const { proposeMutation, previewState } = result.current;

    act(() => {
      result.current.proposeMutation({
        id: "mutation-1",
        changes: [{ id: "obj-1", updates: { x: 500, y: 500 } }],
      });
    });

    // The preview state should reflect the change
    expect(result.current.previewState).toBeDefined();
    expect(result.current.previewState?.changes[0].updates.x).toBe(500);

    // The main store should NOT be changed yet
    const obj = useCanvasStore.getState().objects["obj-1"];
    expect(obj?.x).toBe(0);
  });

  it("should commit the mutation to the main store when accepted", () => {
    const { result } = renderHook(() => useMutationPreview());

    act(() => {
      result.current.proposeMutation({
        id: "mutation-1",
        changes: [{ id: "obj-1", updates: { x: 500, y: 500 } }],
      });
    });

    act(() => {
      result.current.acceptMutation();
    });

    // Preview should be cleared
    expect(result.current.previewState).toBeNull();

    // Main store should now be updated
    const obj = useCanvasStore.getState().objects["obj-1"];
    expect(obj?.x).toBe(500);
    expect(obj?.y).toBe(500);
  });

  it("should discard the mutation when rejected", () => {
    const { result } = renderHook(() => useMutationPreview());

    act(() => {
      result.current.proposeMutation({
        id: "mutation-1",
        changes: [{ id: "obj-1", updates: { x: 500, y: 500 } }],
      });
    });

    act(() => {
      result.current.rejectMutation();
    });

    // Preview should be cleared
    expect(result.current.previewState).toBeNull();

    // Main store should remain unchanged
    const obj = useCanvasStore.getState().objects["obj-1"];
    expect(obj?.x).toBe(0);
  });

  describe("adversarial cases", () => {
    it("should handle accept or reject when no preview is active", () => {
      const { result } = renderHook(() => useMutationPreview());

      expect(() => {
        act(() => {
          result.current.acceptMutation();
          result.current.rejectMutation();
        });
      }).not.toThrow();
    });
  });
});
