// @ts-nocheck
import { useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { rectsIntersect, Rect } from "../utils/math";

export const useFrameContainment = () => {
  const evaluateDrop = useCallback((objectId: string, dropRect: Rect) => {
    const { objects, updateObject } = useCanvasStore.getState();

    // Find all frames
    const frames = Object.values(objects).filter(
      (o) =>
        o.type === "block" &&
        (o as any).blockKind === "frame" &&
        o.id !== objectId,
    );

    // See if the dropped rect intersects with any frame
    // In a real app, we might want to check if it's *mostly* inside the frame.
    // For now, any intersection counts, and we pick the first/topmost frame.
    const intersectingFrame = frames.find((f) => rectsIntersect(dropRect, f));

    if (intersectingFrame) {
      updateObject(objectId, { parentId: intersectingFrame.id });
    } else {
      updateObject(objectId, { parentId: undefined });
    }
  }, []);

  return { evaluateDrop };
};
