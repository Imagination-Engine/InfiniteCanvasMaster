// @ts-nocheck
import { useMemo, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { useShellStore } from "../state/shellStore";
/**
 * Hook providing canvas-aware context to the Orchestrator.
 */
export function useOrchestratorContext() {
  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const sessionContext = useShellStore((s) => s.sessionContext);
  const [lastDroppedBlockId, setLastDroppedBlockId] = useState(null);
  const prevObjectsLength = useRef(Object.keys(objects).length);
  // Track recent drops
  useEffect(() => {
    const currentKeys = Object.keys(objects);
    if (currentKeys.length > prevObjectsLength.current) {
      // Logic: the latest key added is considered the 'drop' for this context
      // This is a simplification; a more robust event system is preferred in production.
      const latestId = currentKeys[currentKeys.length - 1];
      setLastDroppedBlockId(latestId);
    }
    prevObjectsLength.current = currentKeys.length;
  }, [objects]);
  const selectedBlockId = selectedIds.length > 0 ? selectedIds[0] : null;
  const selectedBlock = useMemo(() => {
    if (!selectedBlockId) return null;
    return objects[selectedBlockId] || null;
  }, [selectedBlockId, objects]);
  const lastDroppedBlock = useMemo(() => {
    if (!lastDroppedBlockId) return null;
    return objects[lastDroppedBlockId] || null;
  }, [lastDroppedBlockId, objects]);
  return {
    selectedBlockId,
    selectedBlock,
    lastDroppedBlockId,
    lastDroppedBlock,
    allObjects: objects,
    sessionContext,
  };
}
