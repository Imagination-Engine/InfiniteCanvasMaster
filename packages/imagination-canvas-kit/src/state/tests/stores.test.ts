// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useCanvasStore } from "../canvasStore";
import { useViewportStore } from "../viewportStore";

describe("Canvas Store", () => {
  beforeEach(() => {
    // Clear store/localStorage if possible or reset state
    useCanvasStore.setState({ objects: [], connections: [] });
    localStorage.clear();
  });

  it("should add a block to the store", () => {
    const { addObject } = useCanvasStore.getState();
    const newBlock = {
      id: "block-1",
      type: "block" as const,
      blockType: "note",
      x: 10,
      y: 20,
      width: 100,
      height: 100,
      data: {},
      status: "idle" as const,
    };

    addObject(newBlock);

    const { objects } = useCanvasStore.getState();
    expect(Object.values(objects)).toHaveLength(1);
    expect(Object.values(objects)[0].id).toBe("block-1");
  });

  it("should update an object position", () => {
    const { addObject, updateObject } = useCanvasStore.getState();
    addObject({
      id: "obj-1",
      type: "block" as any,
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    } as any);

    updateObject("obj-1", { x: 100, y: 200 });

    const { objects } = useCanvasStore.getState();
    expect(Object.values(objects)[0].x).toBe(100);
    expect(Object.values(objects)[0].y).toBe(200);
  });
});

describe("Viewport Store", () => {
  beforeEach(() => {
    useViewportStore.setState({ x: 0, y: 0, zoom: 1 });
  });

  it("should update camera state", () => {
    const { setCamera } = useViewportStore.getState();
    setCamera({ x: 500, y: 600, zoom: 0.5 });

    const state = useViewportStore.getState();
    expect(state.x).toBe(500);
    expect(state.zoom).toBe(0.5);
  });

  it("should pan the camera", () => {
    const { pan } = useViewportStore.getState();
    pan(10, 20);

    const state = useViewportStore.getState();
    expect(state.x).toBe(10);
    expect(state.y).toBe(20);
  });
});
