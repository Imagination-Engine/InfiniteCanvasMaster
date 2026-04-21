import React, { memo } from 'react';
import { useOthers } from './liveblocks.config';

export const RemoteCursors = memo(() => {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence || !presence.cursor) return null;

        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            // In a real app, we'd assign colors or names based on connectionId
            color="#3b82f6" 
          />
        );
      })}
    </>
  );
});

const Cursor = memo(({ x, y, color }: { x: number; y: number; color: string }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3745L12.0125 30.0827L14.7171 18.2368L23.4731 16.9455L5.65376 12.3745Z"
          fill={color}
        />
      </svg>
    </div>
  );
});

RemoteCursors.displayName = 'RemoteCursors';
Cursor.displayName = 'Cursor';
