import React, { useRef, useEffect } from "react";
import { useViewportCamera } from "../hooks/useViewportCamera";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { ObjectRenderer } from "./ObjectRenderer";
import { ConnectorLayer } from "./ConnectorLayer";
import { AgentActivityLayer } from "./AgentActivityLayer";
import { PresenceLayer } from "./PresenceLayer";

export const InfiniteViewport: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, pan, zoomAt } = useViewportCamera();
  const objects = useCanvasStore((state) => Object.values(state.objects));
  const { clearSelection } = useSelectionStore();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      zoomAt(e.deltaY, e.clientX, e.clientY);
    } else {
      pan(-e.deltaX, -e.deltaY);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current) {
      clearSelection();
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse or Alt+Left
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

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden outline-none touch-none"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      style={{ cursor: "crosshair" }}
    >
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
          transition: "transform 0.1s ease-out",
        }}
      >
        <ConnectorLayer />
        <AgentActivityLayer />
        {objects.map((obj) => (
          <ObjectRenderer key={obj.id} object={obj} />
        ))}
        {children}
      </div>
      <PresenceLayer />
    </div>
  );
};
