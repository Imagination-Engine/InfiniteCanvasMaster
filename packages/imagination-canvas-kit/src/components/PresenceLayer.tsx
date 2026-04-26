import React from "react";
import { usePresenceStore } from "../state/presenceStore";
import { MousePointer2 } from "lucide-react";

export const PresenceLayer: React.FC = () => {
  const users = usePresenceStore((s) => Object.values(s.users));

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {users.map((user) => (
        <div
          key={user.id}
          className="absolute flex flex-col items-start gap-1 transition-all duration-75"
          style={{ left: user.x, top: user.y }}
        >
          <MousePointer2
            size={16}
            fill={user.color}
            stroke={user.color}
            className="drop-shadow-md"
          />
          <div
            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </div>
  );
};
