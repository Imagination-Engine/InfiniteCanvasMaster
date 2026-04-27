import React from "react";
import { useConnectionStore } from "../state/connectionStore";
import { useCanvasStore } from "../state/canvasStore";

export const ConnectorLayer: React.FC = () => {
  const connectionsRecord = useConnectionStore((s) => s.connections);
  const connections = React.useMemo(
    () => Object.values(connectionsRecord),
    [connectionsRecord],
  );
  const objects = useCanvasStore((s) => s.objects);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        overflow: "visible",
      }}
      className="pointer-events-none z-0"
    >
      <defs>
        <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(123, 92, 234, 0.4)" />
          <stop offset="100%" stopColor="rgba(0, 194, 255, 0.4)" />
        </linearGradient>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0, 194, 255, 0.6)" />
        </marker>
        <style>
          {`
            @keyframes flow-animation {
              from { stroke-dashoffset: 24; }
              to { stroke-dashoffset: 0; }
            }
            .animate-flow {
              stroke-dasharray: 12 12;
              animation: flow-animation 0.8s linear infinite;
            }
          `}
        </style>
      </defs>
      {connections.map((conn) => {
        const from = objects[conn.fromId];
        const to = objects[conn.toId];
        if (!from || !to) return null;

        // Origin at the right center of the source block
        const x1 = from.x + from.width;
        const y1 = from.y + from.height / 2;
        // Destination at the left center of the target block
        const x2 = to.x;
        const y2 = to.y + to.height / 2;

        // Calculate control points for a smooth cubic bezier curve
        const dx = Math.abs(x2 - x1);
        const curveOffset = Math.max(dx / 2, 50); // Minimum curve offset for sharp turns

        const cp1x = x1 + curveOffset;
        const cp1y = y1;
        const cp2x = x2 - curveOffset;
        const cp2y = y2;

        const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

        // Midpoint for label (approximate for cubic bezier)
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={conn.id}>
            <path
              d={pathData}
              fill="none"
              stroke="url(#flow-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
              className="drop-shadow-[0_0_8px_rgba(123,92,234,0.3)] animate-flow transition-all duration-300"
            />
            {conn.label && (
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-30"
                  y="-10"
                  width="60"
                  height="20"
                  rx="10"
                  fill="rgba(17, 17, 40, 0.8)"
                  stroke="rgba(255,255,255,0.1)"
                />
                <text
                  x="0"
                  y="3"
                  fill="rgba(255,255,255,0.8)"
                  fontSize="9"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono uppercase tracking-widest"
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
