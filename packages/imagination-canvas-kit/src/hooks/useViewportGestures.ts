import { useCallback, useRef } from "react";
import { useViewportStore } from "../state/viewportStore";
import { getZoomedOffset } from "../utils/camera";

export function useViewportGestures(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const { x, y, zoom, setCamera, pan } = useViewportStore();
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

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

  return {
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
