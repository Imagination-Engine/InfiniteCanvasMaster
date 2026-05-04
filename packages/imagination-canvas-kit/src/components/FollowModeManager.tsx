import React, { useEffect } from "react";
import { useViewportStore } from "../state/viewportStore";
import { usePresenceStore } from "../state/presenceStore";

export const FollowModeManager: React.FC = () => {
  const { mode, followedUserId, setCamera } = useViewportStore();
  const users = usePresenceStore((state) => state.users);

  useEffect(() => {
    if (mode === "follow" && followedUserId) {
      const targetUser = users[followedUserId];

      // If the followed user updates their viewport, update ours
      if (targetUser && targetUser.viewport) {
        setCamera({
          x: targetUser.viewport.x,
          y: targetUser.viewport.y,
          zoom: targetUser.viewport.zoom,
        });
      }
    }
  }, [mode, followedUserId, users, setCamera]);

  if (mode !== "follow" || !followedUserId) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#3b82f6",
        color: "white",
        padding: "8px 16px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      Following {users[followedUserId]?.name || "Unknown User"}
    </div>
  );
};
