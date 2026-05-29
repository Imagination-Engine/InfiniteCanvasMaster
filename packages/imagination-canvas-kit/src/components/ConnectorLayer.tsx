// @ts-nocheck
import React, { memo } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";
import { useViewportStore } from "../state/viewportStore";
import { useShallow } from "zustand/react/shallow";

const EdgeRenderer = memo(({ connectionId }: { connectionId: string }) => {
  const conn = useConnectionStore((s) => s.connections[connectionId]);
  const removeConnection = useConnectionStore((s) => s.removeConnection);

  // Only subscribe to the specific source and target objects
  const sourceObj = useCanvasStore((s) =>
    conn ? s.objects[conn.fromId] : undefined,
  );
  const targetObj = useCanvasStore((s) =>
    conn ? s.objects[conn.toId] : undefined,
  );

  const [isHovered, setIsHovered] = React.useState(false);

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

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g
      className="group/edge pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background interactive path */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
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

      {/* Midpoint Interactive Delete Button */}
      {isHovered && (
        <g
          className="cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            removeConnection(conn.id);
          }}
        >
          {/* Circular Glassmorphic Background with Glow */}
          <circle
            cx={midX}
            cy={midY}
            r={12}
            className="fill-black/80 stroke-white/20"
            style={{
              filter: "drop-shadow(0px 0px 8px rgba(244, 63, 94, 0.4))",
            }}
          />
          {/* Subtle Red Inner Border on Hover */}
          <circle
            cx={midX}
            cy={midY}
            r={10}
            className="fill-rose-500/10 stroke-rose-500/40 hover:stroke-rose-500 transition-colors"
            strokeWidth={1.5}
          />
          {/* Cross ("X") Icon lines */}
          <path
            d={`M ${midX - 4} ${midY - 4} L ${midX + 4} ${midY + 4} M ${midX + 4} ${midY - 4} L ${midX - 4} ${midY + 4}`}
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
});

export const ConnectorLayer: React.FC = () => {
  const connectionIds = useConnectionStore(
    useShallow((s) => Object.keys(s.connections)),
  );
  const draftConnection = useConnectionStore((s) => s.draftConnection);
  const draftSourceObj = useCanvasStore((s) =>
    draftConnection ? s.objects[draftConnection.fromId] : undefined,
  );

  let draftPath = "";
  if (draftConnection && draftSourceObj) {
    const sWidth = draftSourceObj.width || 320;
    const sHeight = draftSourceObj.height || 240;
    const startX = draftSourceObj.x + sWidth;
    const startY = draftSourceObj.y + sHeight / 2;
    const endX = draftConnection.x;
    const endY = draftConnection.y;
    const dx = Math.abs(endX - startX);
    const controlPointOffset = Math.min(Math.max(dx * 0.4, 50), 200);

    draftPath =
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
  }

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

      {/* Visual Connection Drafting Spline */}
      {draftPath && draftConnection && (
        <g className="opacity-80 pointer-events-none">
          <path
            d={draftPath}
            fill="none"
            stroke="url(#edge-gradient)"
            strokeWidth={3}
            strokeDasharray="5 5"
            className="stroke-brand-cyan animate-flow"
          />
          <circle
            cx={draftConnection.x}
            cy={draftConnection.y}
            r={6}
            className="fill-brand-cyan animate-pulse"
            style={{
              filter: "drop-shadow(0px 0px 6px rgba(0, 194, 255, 0.8))",
            }}
          />
        </g>
      )}
    </svg>
  );
};
