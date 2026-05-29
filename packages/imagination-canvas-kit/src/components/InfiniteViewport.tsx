// @ts-nocheck
import React, { useRef, useEffect } from "react";
import { useViewportCamera } from "../hooks/useViewportCamera";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { useViewportStore } from "../state/viewportStore";
import { ObjectRenderer, type ComponentRegistry } from "./ObjectRenderer";
import { ConnectorLayer } from "./ConnectorLayer";
import { AgentActivityLayer } from "./AgentActivityLayer";
import { PresenceLayer } from "./PresenceLayer";
import { screenToCanvas } from "../utils/camera";
import { blockRegistry } from "@iem/core";

export const InfiniteViewport: React.FC<{
  children?: React.ReactNode;
  registry?: ComponentRegistry;
}> = ({ children, registry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, pan, zoomAt } = useViewportCamera();
  const resizeViewport = useViewportStore((state) => state.resize);
  const objectsRecord = useCanvasStore((state) => state.objects);
  const objects = React.useMemo(
    () => Object.values(objectsRecord),
    [objectsRecord],
  );
  const { clearSelection } = useSelectionStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      resizeViewport(rect.width, rect.height);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [resizeViewport]);

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

    // Pan naturally from empty canvas space; object dragging is handled by ObjectRenderer.
    if (
      e.target === containerRef.current &&
      (e.button === 0 || e.button === 1 || e.button === 2 || e.altKey)
    ) {
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
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const type =
      e.dataTransfer.getData("application/reactflow") ||
      e.dataTransfer.getData("text/plain");

    if (!type || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Use utility for coordinate conversion
    const canvasPoint = screenToCanvas(
      { x: e.clientX - rect.left, y: e.clientY - rect.top },
      viewport,
    );

    const addObject = useCanvasStore.getState().addObject;
    const { select } = useSelectionStore.getState();

    const newId = `${type}-${Date.now()}`;

    // Look up block definition for better metadata
    const blockDef = blockRegistry.get(type);

    addObject({
      id: newId,
      type: type as any,
      x: canvasPoint.x,
      y: canvasPoint.y,
      width: blockDef?.width || 320,
      height: blockDef?.height || 240,
      zIndex: 1,
      status: "idle",
      rotation: 0,
      metadata: {
        label: blockDef?.name || `New ${type.split(".").pop()}`,
        description: blockDef?.description || "",
        capabilities: blockDef?.capabilities || [],
        runtime: blockDef?.runtime || "LIVE",
      },
    });

    // Select the new block
    select(newId);

    console.log(`[CANVAS] Block added: ${newId} (${type})`);
  };

  return (
    <div
      ref={containerRef}
      data-testid="infinite-viewport"
      className="absolute inset-0 w-full h-full overflow-hidden outline-none touch-none bg-brand-bg-page"
      onPointerDown={handlePointerDown}
      onContextMenu={handleContextMenu}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        cursor: "grab",
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
