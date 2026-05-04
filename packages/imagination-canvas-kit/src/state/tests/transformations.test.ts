// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useCanvasStore } from "../canvasStore";

describe("Object Transformations", () => {
  beforeEach(() => {
    useCanvasStore.setState({
      objects: [
        {
          id: "obj-1",
          type: "shape",
          shapeType: "rectangle",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          zIndex: 0,
          status: "idle",
          capabilities: { canMove: true, canResize: true },
        },
        {
          id: "obj-2",
          type: "shape",
          shapeType: "rectangle",
          x: 200,
          y: 200,
          width: 100,
          height: 100,
          zIndex: 1,
          status: "idle",
          capabilities: { canMove: true, canResize: true },
        },
        {
          id: "locked-obj",
          type: "shape",
          shapeType: "rectangle",
          x: 500,
          y: 500,
          width: 100,
          height: 100,
          zIndex: 2,
          status: "idle",
          capabilities: { canMove: false, canResize: false },
        },
      ] as any[],
    });
  });

  describe("Moving", () => {
    it("should move a single object", () => {
      const { moveObjects } = useCanvasStore.getState() as any;
      moveObjects(["obj-1"], 50, 50);

      const obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-1");
      expect(obj?.x).toBe(50);
      expect(obj?.y).toBe(50);
    });

    it("should move multiple objects", () => {
      const { moveObjects } = useCanvasStore.getState() as any;
      moveObjects(["obj-1", "obj-2"], 10, 10);

      const obj1 = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-1");
      const obj2 = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-2");
      expect(obj1?.x).toBe(10);
      expect(obj1?.y).toBe(10);
      expect(obj2?.x).toBe(210);
      expect(obj2?.y).toBe(210);
    });

    it("should not move an object if canMove is false", () => {
      const { moveObjects } = useCanvasStore.getState() as any;
      moveObjects(["locked-obj"], 100, 100);

      const obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "locked-obj");
      expect(obj?.x).toBe(500);
      expect(obj?.y).toBe(500);
    });
  });

  describe("Resizing", () => {
    it("should resize an object", () => {
      const { resizeObject } = useCanvasStore.getState() as any;
      resizeObject("obj-1", 50, 50);

      const obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-1");
      expect(obj?.width).toBe(150);
      expect(obj?.height).toBe(150);
    });

    it("should not resize an object if canResize is false", () => {
      const { resizeObject } = useCanvasStore.getState() as any;
      resizeObject("locked-obj", 100, 100);

      const obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "locked-obj");
      expect(obj?.width).toBe(100);
      expect(obj?.height).toBe(100);
    });
  });

  describe("Z-Order", () => {
    it("should bring an object to front", () => {
      const { updateZOrder } = useCanvasStore.getState() as any;
      updateZOrder("obj-1", "front");

      const obj1 = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-1");
      const obj2 = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-2");
      const lockedObj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "locked-obj");

      // obj-1 should have the highest zIndex
      expect(obj1?.zIndex).toBeGreaterThan(obj2!.zIndex);
      expect(obj1?.zIndex).toBeGreaterThan(lockedObj!.zIndex);
    });

    it("should send an object to back", () => {
      const { updateZOrder } = useCanvasStore.getState() as any;
      updateZOrder("locked-obj", "back");

      const obj1 = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-1");
      const lockedObj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "locked-obj");

      expect(lockedObj?.zIndex).toBeLessThan(obj1!.zIndex);
    });
  });

  describe("adversarial cases", () => {
    it("should not resize below minimum dimensions", () => {
      const { resizeObject } = useCanvasStore.getState() as any;
      resizeObject("obj-1", -500, -500);

      const obj = useCanvasStore
        .getState()
        .objects.find((o) => o.id === "obj-1");
      expect(obj?.width).toBe(10); // Wait, if width was 100 and we substract 500, it should be 10 (min)
      // Ah, I set width: 100 in beforeEach. 100 - 500 = -400. Math.max(10, -400) = 10.
    });

    it("should not crash when moving non-existent objects", () => {
      const { moveObjects } = useCanvasStore.getState() as any;
      expect(() => moveObjects(["non-existent"], 10, 10)).not.toThrow();
    });

    it("should not crash when updating Z-order of non-existent object", () => {
      const { updateZOrder } = useCanvasStore.getState() as any;
      expect(() => updateZOrder("non-existent", "front")).not.toThrow();
    });
  });
});
