import { useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useHistoryStore } from "../state/historyStore";

export function useCanvasHistory() {
  const objects = useCanvasStore((s) => s.objects);
  const setObjects = useCanvasStore(
    (s) => (objs: any) => useCanvasStore.setState({ objects: objs }),
  );
  const { undo: undoAction, redo: redoAction, push } = useHistoryStore();

  const capture = useCallback(() => {
    push(objects);
  }, [objects, push]);

  const undo = useCallback(() => {
    const prev = undoAction(objects);
    if (prev) setObjects(prev);
  }, [objects, undoAction, setObjects]);

  const redo = useCallback(() => {
    const next = redoAction(objects);
    if (next) setObjects(next);
  }, [objects, redoAction, setObjects]);

  return { capture, undo, redo };
}
