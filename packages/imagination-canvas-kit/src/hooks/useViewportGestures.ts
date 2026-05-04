import { useCallback, useRef, TouchEvent } from "react";
import { useViewportStore } from "../state/viewportStore";
import { getZoomedOffset } from "../utils/camera";

export function useViewportGestures(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const { x, y, zoom, setCamera, pan } = useViewportStore();
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  // Touch state
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      // Zoom behavior
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = 1.1;
        const nextZoom = delta > 0 ? zoom * factor : zoom / factor;

        // Limit zoom
        const limitedZoom = Math.min(Math.max(0.05, nextZoom), 16);

        const pointer = { x: e.clientX, y: e.clientY };
        const nextOffset = getZoomedOffset(
          pointer,
          { x, y, zoom },
          limitedZoom,
        );

        setCamera({
          x: nextOffset.x,
          y: nextOffset.y,
          zoom: limitedZoom,
        });
      } else {
        // Regular pan via scroll
        pan(e.deltaX / zoom, e.deltaY / zoom);
      }
    },
    [x, y, zoom, setCamera, pan],
  );

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Left
      isPanning.current = true;
      lastPoint.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastPoint.current.x;
        const dy = e.clientY - lastPoint.current.y;

        pan(-dx / zoom, -dy / zoom);
        lastPoint.current = { x: e.clientX, y: e.clientY };
      }
    },
    [zoom, pan],
  );

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const onTouchStart = useCallback((e: TouchEvent | any) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      lastTouchDist.current = dist;
      lastTouchCenter.current = center;
      isPanning.current = true;
    } else if (e.touches.length === 1) {
      // 1 finger pan setup or drawing setup depending on context
      isPanning.current = true;
      lastPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchDist.current = null;
      lastTouchCenter.current = null;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: TouchEvent | any) => {
      if (!isPanning.current) return;

      if (
        e.touches.length === 2 &&
        lastTouchDist.current !== null &&
        lastTouchCenter.current !== null
      ) {
        e.preventDefault();
        const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        // Calculate zoom
        const zoomDelta = dist / lastTouchDist.current;
        const nextZoom = zoom * zoomDelta;
        const limitedZoom = Math.min(Math.max(0.05, nextZoom), 16);

        // Apply Zoom around center
        const nextOffset = getZoomedOffset(center, { x, y, zoom }, limitedZoom);

        // Calculate Pan (drift of center)
        const panDx = center.x - lastTouchCenter.current.x;
        const panDy = center.y - lastTouchCenter.current.y;

        setCamera({
          x: nextOffset.x - panDx / limitedZoom,
          y: nextOffset.y - panDy / limitedZoom,
          zoom: limitedZoom,
        });

        lastTouchDist.current = dist;
        lastTouchCenter.current = center;
      } else if (e.touches.length === 1 && lastTouchDist.current === null) {
        const dx = e.touches[0].clientX - lastPoint.current.x;
        const dy = e.touches[0].clientY - lastPoint.current.y;

        pan(-dx / zoom, -dy / zoom);
        lastPoint.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [x, y, zoom, pan, setCamera],
  );

  const onTouchEnd = useCallback(() => {
    isPanning.current = false;
    lastTouchDist.current = null;
    lastTouchCenter.current = null;
  }, []);

  return {
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
