import { useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useHistoryStore } from "../state/historyStore";

export function useCanvasHistory() {
  const { undo: undoAction, redo: redoAction, push } = useHistoryStore();

  const capture = useCallback(() => {
    const currentObjects = useCanvasStore.getState().objects;
    push(currentObjects);
  }, [push]);

  const undo = useCallback(() => {
    const currentObjects = useCanvasStore.getState().objects;
    const prev = undoAction(currentObjects);
    if (prev) {
      useCanvasStore.setState({ objects: prev });
    }
  }, [undoAction]);

  const redo = useCallback(() => {
    const currentObjects = useCanvasStore.getState().objects;
    const next = redoAction(currentObjects);
    if (next) {
      useCanvasStore.setState({ objects: next });
    }
  }, [redoAction]);

  return { capture, undo, redo };
}
