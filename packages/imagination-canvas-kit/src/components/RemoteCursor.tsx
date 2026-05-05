// @ts-nocheck
import React from "react";
import { CanvasPresence } from "../state/presenceStore";

interface RemoteCursorProps {
  presence: CanvasPresence;
}

export const RemoteCursor: React.FC<RemoteCursorProps> = ({ presence }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${presence.x}px, ${presence.y}px)`,
        pointerEvents: "none", // Cursors shouldn't block interactions
        zIndex: 9999, // Ensure cursors are always on top
        transition: "transform 0.1s linear", // Smooth interpolation
      }}
    >
      {/* SVG Cursor Pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={presence.color}
        stroke="white"
        strokeWidth="2"
      >
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.42c.45 0 .67-.54.35-.85L5.5 3.21z" />
      </svg>

      {/* Name Tag */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 20,
          backgroundColor: presence.color,
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {presence.name}
      </div>

      {/* Agent Halo */}
      {presence.isAgent && (
        <div
          className="agent-halo"
          style={{
            position: "absolute",
            top: -10,
            left: -10,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: `2px dashed ${presence.color}`,
            animation: "spin 4s linear infinite",
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
};
