import { useEffect } from "react";
import { useSelectionStore } from "../state/selectionStore";
import { useCanvasStore } from "../state/canvasStore";
import { useCanvasHistory } from "./useCanvasHistory";

export function useKeyboardShortcuts() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const updateObject = useCanvasStore((s) => s.updateObject);
  const objects = useCanvasStore((s) => s.objects);
  const { undo, redo, capture } = useCanvasHistory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIds.length === 0) {
        if ((e.metaKey || e.ctrlKey) && e.key === "z") {
          if (e.shiftKey) redo();
          else undo();
        }
        return;
      }

      // Nudge logic
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        capture();
        const step = e.shiftKey ? 10 : 1;

        selectedIds.forEach((id) => {
          const obj = objects[id];
          if (!obj) return;

          let dx = 0;
          let dy = 0;
          if (e.key === "ArrowUp") dy = -step;
          if (e.key === "ArrowDown") dy = step;
          if (e.key === "ArrowLeft") dx = -step;
          if (e.key === "ArrowRight") dx = step;

          updateObject(id, { x: obj.x + dx, y: obj.y + dy });
        });
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, objects, updateObject, undo, redo, capture]);
}
