// @ts-nocheck
import { useCallback } from "react";
import { useExpansionStore, ExpansionMode } from "../state/expansionStore";
import { useViewportStore } from "../state/viewportStore";

export const useExpansionContext = () => {
  const triggerExpansion = useCallback(
    (blockId: string, mode: ExpansionMode) => {
      const viewportStore = useViewportStore.getState();
      const expansionStore = useExpansionStore.getState();

      // Push current camera state
      viewportStore.focusOn(
        { x: viewportStore.x, y: viewportStore.y, zoom: viewportStore.zoom },
        `expansion:${blockId}`,
      );

      // Set expansion
      expansionStore.setExpanded(blockId, mode);
    },
    [],
  );

  const closeExpansion = useCallback(() => {
    const viewportStore = useViewportStore.getState();
    const expansionStore = useExpansionStore.getState();

    // Clear expansion
    expansionStore.clearExpanded();

    // Pop camera state to return to previous position
    viewportStore.returnToPrevious();
  }, []);

  return { triggerExpansion, closeExpansion };
};
