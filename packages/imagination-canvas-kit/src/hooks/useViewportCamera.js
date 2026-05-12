// @ts-nocheck
import { useCallback } from "react";
import { useViewportStore } from "../state/viewportStore";
export function useViewportCamera() {
  const store = useViewportStore();
  // The viewport state variables are spread directly on the store root,
  // not under a 'viewport' key. We must construct a synthetic viewport object.
  const viewport = {
    x: store.x,
    y: store.y,
    zoom: store.zoom,
  };
  const updateViewport = store.setCamera;
  const pan = useCallback(
    (dx, dy) => {
      updateViewport({
        x: viewport.x + dx,
        y: viewport.y + dy,
      });
    },
    [viewport.x, viewport.y, updateViewport],
  );
  const zoomAt = useCallback(
    (delta, centerX, centerY) => {
      // Much more sensitive zoom factor for pinch (touch) and wheel
      // A delta of 100 will scale by ~1.5x
      const scaleFactor = Math.exp(-delta * 0.005);
      const nextZoom = Math.min(
        Math.max(viewport.zoom * scaleFactor, 0.05),
        20,
      );
      // Effective scale factor after clamping
      const effectiveScale = nextZoom / viewport.zoom;
      // The point under the mouse (centerX, centerY) in viewport coordinates
      // must remain at the same position after scaling.
      // NewX = centerX - (centerX - OldX) * scale
      const nextX = centerX - (centerX - viewport.x) * effectiveScale;
      const nextY = centerY - (centerY - viewport.y) * effectiveScale;
      updateViewport({
        x: nextX,
        y: nextY,
        zoom: nextZoom,
      });
    },
    [viewport, updateViewport],
  );
  return {
    viewport,
    pan,
    zoomAt,
  };
}
