/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useFrameContainment } from "../useFrameContainment";
import { useCanvasStore } from "../../state/canvasStore";
import { renderHook, act } from "@testing-library/react";

describe("useFrameContainment", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });

    useCanvasStore.getState().addObject({
      id: "frame-1",
      type: "block",
      blockKind: "frame",
      x: 100,
      y: 100,
      width: 400,
      height: 400,
      status: "idle",
      data: {},
    } as any);

    useCanvasStore.getState().addObject({
      id: "obj-1",
      type: "shape",
      shapeType: "rectangle",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      status: "idle",
      data: {},
    } as any);
  });

  it("should parent an object to a frame if dropped inside it", () => {
    const { result } = renderHook(() => useFrameContainment());
    const { evaluateDrop } = result.current;

    act(() => {
      // Simulate dropping obj-1 inside frame-1
      evaluateDrop("obj-1", { x: 200, y: 200, width: 50, height: 50 });
    });

    const obj = useCanvasStore.getState().objects.find((o) => o.id === "obj-1");
    expect(obj?.parentId).toBe("frame-1");
  });

  it("should remove parentId if dropped outside the frame", () => {
    const { result } = renderHook(() => useFrameContainment());
    const { evaluateDrop } = result.current;

    // Set initial parent
    useCanvasStore.getState().updateObject("obj-1", { parentId: "frame-1" });

    act(() => {
      // Simulate dropping obj-1 outside any frame
      evaluateDrop("obj-1", { x: 0, y: 0, width: 50, height: 50 });
    });

    const obj = useCanvasStore.getState().objects.find((o) => o.id === "obj-1");
    expect(obj?.parentId).toBeUndefined();
  });

  describe("adversarial cases", () => {
    it("should not allow an object to be parented to itself", () => {
      const { result } = renderHook(() => useFrameContainment());
      const { evaluateDrop } = result.current;

      act(() => {
        // frame-1 drops onto itself
        evaluateDrop("frame-1", { x: 100, y: 100, width: 400, height: 400 });
      });

      const obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "frame-1");
      expect(obj?.parentId).toBeUndefined(); // Should not be 'frame-1'
    });
  });
});
