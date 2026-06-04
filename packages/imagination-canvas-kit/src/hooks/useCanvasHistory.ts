import { useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useHistoryStore, CanvasStateSnapshot } from "../state/historyStore";

export function useCanvasHistory() {
  const {
    undo: undoAction,
    redo: redoAction,
    pushMutation,
  } = useHistoryStore();

  const capture = useCallback(
    (type: string = "action") => {
      const canvasStore = useCanvasStore.getState();
      const beforeState: CanvasStateSnapshot = {
        objects: { ...canvasStore.objects },
        connections: [...canvasStore.connections],
        bindings: [...canvasStore.bindings],
      };

      queueMicrotask(() => {
        const nextCanvasStore = useCanvasStore.getState();
        const afterState: CanvasStateSnapshot = {
          objects: { ...nextCanvasStore.objects },
          connections: [...nextCanvasStore.connections],
          bindings: [...nextCanvasStore.bindings],
        };

        // Check if state actually changed
        if (JSON.stringify(beforeState) === JSON.stringify(afterState)) {
          return;
        }

        pushMutation({
          type,
          before: beforeState,
          after: afterState,
        });
      });
    },
    [pushMutation],
  );

  const undo = useCallback(() => {
    undoAction();
  }, [undoAction]);

  const redo = useCallback(() => {
    redoAction();
  }, [redoAction]);

  return { capture, undo, redo };
}
