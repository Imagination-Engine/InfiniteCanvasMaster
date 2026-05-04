import React, { useMemo } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useViewportStore } from "../state/viewportStore";

export const ConnectorLayer: React.FC = () => {
  const connections = useCanvasStore((s) => s.connections);
  const objectsRecord = useCanvasStore((s) => s.objects);
  const zoom = useViewportStore((s) => s.zoom);

  const objects = useMemo(() => {
    return Array.isArray(objectsRecord)
      ? objectsRecord
      : Object.values(objectsRecord);
  }, [objectsRecord]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 194, 255, 0.4)" />
          <stop offset="50%" stopColor="rgba(0, 194, 255, 0.8)" />
          <stop offset="100%" stopColor="rgba(0, 194, 255, 0.4)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((conn) => {
        const sourceObj = objects.find((o) => o.id === conn.sourceId);
        const targetObj = objects.find((o) => o.id === conn.targetId);

        if (!sourceObj || !targetObj) return null;

        const startX = sourceObj.x + sourceObj.width;
        const startY = sourceObj.y + sourceObj.height / 2;

        const endX = targetObj.x;
        const endY = targetObj.y + targetObj.height / 2;

        const controlPointOffset = Math.max(Math.abs(endX - startX) * 0.5, 100);
        const path =
          "M " +
          startX +
          " " +
          startY +
          " C " +
          (startX + controlPointOffset) +
          " " +
          startY +
          ", " +
          (endX - controlPointOffset) +
          " " +
          endY +
          ", " +
          endX +
          " " +
          endY;

        return (
          <g key={conn.id}>
            <path
              d={path}
              fill="none"
              stroke="url(#edge-gradient)"
              strokeWidth={3}
              className="opacity-50"
              filter="url(#glow)"
            />
            <circle r={3} fill="#fff" filter="url(#glow)">
              <animateMotion dur="3s" repeatCount="indefinite" path={path} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
