import { useCallback } from "react";
import { useViewportStore } from "../state/viewportStore";

export function useViewportCamera() {
  const { viewport, updateViewport } = useViewportStore();

  const pan = useCallback(
    (dx: number, dy: number) => {
      updateViewport({
        x: viewport.x + dx,
        y: viewport.y + dy,
      });
    },
    [viewport.x, viewport.y, updateViewport],
  );

  const zoomAt = useCallback(
    (delta: number, centerX: number, centerY: number) => {
      const scaleFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(viewport.zoom * scaleFactor, 0.1), 10);

      // Zoom math to keep the point under the mouse stable
      const dx = (centerX - viewport.x) * (1 - scaleFactor);
      const dy = (centerY - viewport.y) * (1 - scaleFactor);

      updateViewport({
        x: viewport.x + dx,
        y: viewport.y + dy,
        zoom: newZoom,
      });
    },
    [viewport.x, viewport.y, viewport.zoom, updateViewport],
  );

  return {
    viewport,
    pan,
    zoomAt,
  };
}
