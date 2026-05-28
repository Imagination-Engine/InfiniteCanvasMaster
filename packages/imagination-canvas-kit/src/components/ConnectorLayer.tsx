// @ts-nocheck
import React, { memo } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";
import { useViewportStore } from "../state/viewportStore";
import { useShallow } from "zustand/react/shallow";

const EdgeRenderer = memo(({ connectionId }: { connectionId: string }) => {
  const conn = useConnectionStore((s) => s.connections[connectionId]);
  
  // Only subscribe to the specific source and target objects
  const sourceObj = useCanvasStore((s) => conn ? s.objects[conn.fromId] : undefined);
  const targetObj = useCanvasStore((s) => conn ? s.objects[conn.toId] : undefined);

  if (!conn || !sourceObj || !targetObj) return null;

  const sWidth = sourceObj.width || 320;
  const sHeight = sourceObj.height || 240;
  const startX = sourceObj.x + sWidth;
  const startY = sourceObj.y + sHeight / 2;

  const tWidth = targetObj.width || 320;
  const tHeight = targetObj.height || 240;
  const endX = targetObj.x;
  const endY = targetObj.y + tHeight / 2;

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
    <g className="group/edge">
      {/* Background interactive path */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="pointer-events-auto cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Edge clicked:", conn.id);
        }}
      />

      {/* Visible path */}
      <path
        d={path}
        fill="none"
        stroke="url(#edge-gradient)"
        strokeWidth={3}
        className="transition-colors transition-opacity duration-300 opacity-80 group-hover/edge:opacity-100 group-hover/edge:stroke-brand-cyan"
      />

      {/* Pulse animation for active connections */}
      <path
        d={path}
        fill="none"
        stroke="#00c2ff"
        strokeWidth={4}
        strokeDasharray="4 20"
        className="animate-flow opacity-60"
      />
    </g>
  );
});

export const ConnectorLayer: React.FC = () => {
  const connectionIds = useConnectionStore(useShallow((s) => Object.keys(s.connections)));

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ overflow: "visible", width: 1, height: 1 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#00C2FF" />
        </marker>

        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 194, 255, 0.2)" />
          <stop offset="50%" stopColor="rgba(0, 194, 255, 0.6)" />
          <stop offset="100%" stopColor="rgba(0, 194, 255, 0.2)" />
        </linearGradient>

        <filter id="glow-connector">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>
          {`
            @keyframes flow-animation {
              from { stroke-dashoffset: 24; }
              to { stroke-dashoffset: 0; }
            }
            .animate-flow {
              animation: flow-animation 1s linear infinite;
            }
          `}
        </style>
      </defs>

      {connectionIds.map((id) => (
        <EdgeRenderer key={id} connectionId={id} />
      ))}
    </svg>
  );
};
