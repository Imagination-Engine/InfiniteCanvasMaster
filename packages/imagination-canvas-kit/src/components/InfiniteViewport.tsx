import React, { useRef, useEffect } from "react";
import { useViewportCamera } from "../hooks/useViewportCamera";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { ObjectRenderer, ComponentRegistry } from "./ObjectRenderer";
import { ConnectorLayer } from "./ConnectorLayer";
import { AgentActivityLayer } from "./AgentActivityLayer";
import { PresenceLayer } from "./PresenceLayer";

export const InfiniteViewport: React.FC<{
  children?: React.ReactNode;
  registry?: ComponentRegistry;
}> = ({ children, registry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, pan, zoomAt } = useViewportCamera();
  const objectsRecord = useCanvasStore((state) => state.objects);
  const objects = React.useMemo(
    () => Object.values(objectsRecord),
    [objectsRecord],
  );
  const { clearSelection } = useSelectionStore();

  // --- Gesture State ---
  const lastTouchRef = useRef<{
    distance: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Use native listener to ensure non-passive preventDefault for wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.deltaY, clientX, clientY);
      } else {
        pan(-e.deltaX, -e.deltaY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const dist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY,
        );
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        const rect = container.getBoundingClientRect();
        const localCenterX = centerX - rect.left;
        const localCenterY = centerY - rect.top;

        if (lastTouchRef.current) {
          const deltaDist = lastTouchRef.current.distance - dist;
          // Zoom
          zoomAt(deltaDist * 2, localCenterX, localCenterY);
          // Pan with midpoint
          pan(
            centerX - lastTouchRef.current.centerX,
            centerY - lastTouchRef.current.centerY,
          );
        }

        lastTouchRef.current = { distance: dist, centerX, centerY };
      }
    };

    const handleTouchEnd = () => {
      lastTouchRef.current = null;
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleNativeWheel);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pan, zoomAt]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current) {
      clearSelection();
    }

    // Panning with Middle Mouse (1), Right Click (2), or Alt+Left (0)
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;

      const onMove = (moveEvent: PointerEvent) => {
        pan(moveEvent.clientX - startX, moveEvent.clientY - startY);
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const type = e.dataTransfer.getData("application/reactflow");
    if (!type || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Project screen coordinates to canvas coordinates
    // CanvasX = (ScreenX - PanX) / Zoom
    const canvasX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const canvasY = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    const addObject = useCanvasStore.getState().addObject;
    addObject({
      id: `${type}-${Date.now()}`,
      type,
      x: canvasX,
      y: canvasY,
      width: 300,
      height: 200,
      zIndex: 1,
      status: "idle",
      rotation: 0,
      metadata: {
        label: `New ${type}`,
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden outline-none touch-none bg-brand-bg-page"
      onPointerDown={handlePointerDown}
      onContextMenu={handleContextMenu}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        cursor: "crosshair",
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
        backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        <ConnectorLayer />
        <AgentActivityLayer />
        {objects.map((obj) => (
          <ObjectRenderer key={obj.id} object={obj} registry={registry} />
        ))}
        {children}
      </div>
      <PresenceLayer />
    </div>
  );
};
