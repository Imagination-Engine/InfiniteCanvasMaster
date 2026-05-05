// @ts-nocheck
import React, { useMemo } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";
import { useViewportStore } from "../state/viewportStore";

export const ConnectorLayer: React.FC = () => {
  const connectionsRecord = useConnectionStore((s) => s.connections);
  const connections = useMemo(
    () => Object.values(connectionsRecord),
    [connectionsRecord],
  );
  const objectsRecord = useCanvasStore((s) => s.objects);

  const objects = useMemo(() => {
    return Object.values(objectsRecord);
  }, [objectsRecord]);

  console.log(
    `[ConnectorLayer] Rendering ${connections.length} connections with ${objects.length} objects.`,
  );

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ overflow: "visible", width: 1, height: 1 }}
    >
      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 194, 255, 0.2)" />
          <stop offset="50%" stopColor="rgba(0, 194, 255, 0.6)" />
          <stop offset="100%" stopColor="rgba(0, 194, 255, 0.2)" />
        </linearGradient>

        <marker
          id="dot-end"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <circle
            cx="4"
            cy="4"
            r="3"
            fill="rgba(0, 194, 255, 1)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        </marker>

        <filter id="glow-connector">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((conn) => {
        const sourceObj = objects.find((o) => o.id === conn.fromId);
        const targetObj = objects.find((o) => o.id === conn.toId);

        if (!sourceObj || !targetObj) return null;

        const startX = sourceObj.x + sourceObj.width;
        const startY = sourceObj.y + sourceObj.height / 2;

        const endX = targetObj.x;
        const endY = targetObj.y + targetObj.height / 2;

        const dx = Math.abs(endX - startX);
        const controlPointOffset = Math.min(Math.max(dx * 0.4, 50), 200);

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
          <g key={conn.id} className="group/edge">
            {/* Background interactive path */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="pointer-events-auto cursor-pointer"
            />

            {/* Visible path */}
            <path
              d={path}
              fill="none"
              stroke="url(#edge-gradient)"
              strokeWidth={3}
              className="transition-all duration-300 opacity-80 group-hover/edge:opacity-100 group-hover/edge:stroke-brand-cyan"
              markerEnd="url(#dot-end)"
              filter="url(#glow-connector)"
            />

            {/* Pulse animation for active connections */}
            <circle
              r={3}
              fill="#00c2ff"
              className="shadow-[0_0_12px_rgba(0,194,255,1)]"
            >
              <animateMotion dur="2s" repeatCount="indefinite" path={path} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
