// @ts-nocheck
import { useRef, useCallback, useEffect } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";

export const useBlockAutosave = (blockId: string, debounceMs: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateData = useCallback(
    (newData: any) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        // In a real implementation we might fetch the current block to merge
        const objects = useCanvasStore.getState().objects;
        const currentBlock = objects.find((o) => o.id === blockId);

        if (currentBlock) {
          useCanvasStore.getState().updateObject(blockId, {
            data: { ...(currentBlock as any).data, ...newData },
          });
        }
      }, debounceMs);
    },
    [blockId, debounceMs],
  );

  const applyAgentMutation = useCallback(
    (newData: any): boolean => {
      const { editingId } = useSelectionStore.getState();

      // Reject agent mutation if the user is currently editing this exact block
      if (editingId === blockId) {
        console.warn(
          `Agent mutation rejected: Block ${blockId} is currently locked by the user.`,
        );
        return false;
      }

      // Apply immediately if not locked
      const objects = useCanvasStore.getState().objects;
      const currentBlock = objects.find((o) => o.id === blockId);

      if (currentBlock) {
        useCanvasStore.getState().updateObject(blockId, {
          data: { ...(currentBlock as any).data, ...newData },
        });
        return true;
      }

      return false;
    },
    [blockId],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { updateData, applyAgentMutation };
};
