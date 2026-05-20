// @ts-nocheck
import { useMemo, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { useShellStore } from "../state/shellStore";
import {
  buildBlockOrchestratorContext,
  buildStudioCapabilitySummary,
  studioInteropResolver,
} from "@iem/core";

/**
 * Hook providing canvas-aware context to the Orchestrator.
 */
export function useOrchestratorContext() {
  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const sessionContext = useShellStore((s) => s.sessionContext);

  const [lastDroppedBlockId, setLastDroppedBlockId] = useState<string | null>(
    null,
  );
  const prevObjectsLength = useRef(Object.keys(objects).length);

  useEffect(() => {
    const currentKeys = Object.keys(objects);
    if (currentKeys.length > prevObjectsLength.current) {
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

  const selectedBlockKind = useMemo(() => {
    if (!selectedBlock) return null;
    return (selectedBlock as any).blockKind || selectedBlock.type || null;
  }, [selectedBlock]);

  const blockContext = useMemo(() => {
    if (!selectedBlockKind) return null;
    return buildBlockOrchestratorContext(selectedBlockKind);
  }, [selectedBlockKind]);

  const compatibleBlocks = useMemo(() => {
    if (!selectedBlockKind) return [];
    return studioInteropResolver.suggestCompatibleBlocks(selectedBlockKind);
  }, [selectedBlockKind]);

  const studioCapabilitySummary = useMemo(
    () => buildStudioCapabilitySummary(),
    [],
  );

  const resolveBlockId = (object: { type?: string; blockKind?: string }) =>
    (object as any).blockKind || object.type || "";

  return {
    selectedBlockId,
    selectedBlock,
    selectedBlockKind,
    lastDroppedBlockId,
    lastDroppedBlock,
    allObjects: objects,
    sessionContext,
    blockContext,
    compatibleBlocks,
    missingToolMounts: blockContext?.missingToolMounts ?? [],
    studioCapabilitySummary,
  };
}
