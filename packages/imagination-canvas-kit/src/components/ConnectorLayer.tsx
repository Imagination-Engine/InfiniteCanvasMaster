import React from "react";
import { useConnectionStore } from "../state/connectionStore";
import { useCanvasStore } from "../state/canvasStore";

export const ConnectorLayer: React.FC = () => {
  const connections = useConnectionStore((s) => Object.values(s.connections));
  const objects = useCanvasStore((s) => s.objects);

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.2)" />
        </marker>
      </defs>
      {connections.map((conn) => {
        const from = objects[conn.fromId];
        const to = objects[conn.toId];
        if (!from || !to) return null;

        const x1 = from.x + from.width / 2;
        const y1 = from.y + from.height / 2;
        const x2 = to.x + to.width / 2;
        const y2 = to.y + to.height / 2;

        return (
          <g key={conn.id}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            {conn.label && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2}
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                textAnchor="middle"
                className="font-mono uppercase tracking-tighter"
              >
                {conn.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
