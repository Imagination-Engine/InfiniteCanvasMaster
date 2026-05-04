// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore, CanvasMutation } from "../historyStore";
import { useCanvasStore } from "../canvasStore";

describe("CanvasMutation Engine & Undo Stack", () => {
  beforeEach(() => {
    useHistoryStore.setState({ past: [], future: [] });
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });
  });

  it("should push a mutation and allow undoing", () => {
    const { pushMutation, undo } = useHistoryStore.getState();
    const { addObject } = useCanvasStore.getState();

    const initialState = { objects: [], connections: [], bindings: [] };

    addObject({
      id: "obj-1",
      type: "shape",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    } as any);

    const newState = {
      objects: [
        {
          id: "obj-1",
          type: "shape",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        } as any,
      ],
      connections: [],
      bindings: [],
    };

    pushMutation({
      type: "object.created",
      before: initialState,
      after: newState,
    });

    expect(useHistoryStore.getState().past).toHaveLength(1);

    undo();

    expect(useCanvasStore.getState().objects).toHaveLength(0);
    expect(useHistoryStore.getState().future).toHaveLength(1);
  });

  it("should allow redoing a mutation", () => {
    const { pushMutation, undo, redo } = useHistoryStore.getState();

    const initialState = { objects: [], connections: [], bindings: [] };
    const newState = {
      objects: [
        {
          id: "obj-1",
          type: "shape",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        } as any,
      ],
      connections: [],
      bindings: [],
    };

    pushMutation({
      type: "object.created",
      before: initialState,
      after: newState,
    });

    undo();
    redo();

    expect(useCanvasStore.getState().objects).toHaveLength(1);
  });

  it("should gracefully handle undo/redo when empty", () => {
    const { undo, redo } = useHistoryStore.getState();
    expect(() => undo()).not.toThrow();
    expect(() => redo()).not.toThrow();
  });

  describe("adversarial cases", () => {
    it("should cap the history stack at 50 to prevent memory leaks", () => {
      const { pushMutation } = useHistoryStore.getState();

      for (let i = 0; i < 60; i++) {
        pushMutation({
          type: "test",
          before: { objects: [], connections: [], bindings: [] },
          after: {
            objects: [{ id: `obj-${i}` }] as any,
            connections: [],
            bindings: [],
          },
        });
      }

      const { past } = useHistoryStore.getState();
      expect(past).toHaveLength(50);
      expect(past[0].after.objects[0].id).toBe("obj-10"); // 0-9 were dropped
      expect(past[49].after.objects[0].id).toBe("obj-59");
    });
  });
});
