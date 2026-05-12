import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import React from "react";
import { usePresenceStore } from "../state/presenceStore";
import { MousePointer2 } from "lucide-react";
export const PresenceLayer = () => {
  const usersRecord = usePresenceStore((s) => s.users);
  const users = React.useMemo(() => Object.values(usersRecord), [usersRecord]);
  return _jsx("div", {
    className: "absolute inset-0 pointer-events-none z-50",
    children: users.map((user) =>
      _jsxs(
        "div",
        {
          className:
            "absolute flex flex-col items-start gap-1 transition-all duration-75",
          style: { left: user.x, top: user.y },
          children: [
            _jsx(MousePointer2, {
              size: 16,
              fill: user.color,
              stroke: user.color,
              className: "drop-shadow-md",
            }),
            _jsx("div", {
              className:
                "px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm whitespace-nowrap",
              style: { backgroundColor: user.color },
              children: user.name,
            }),
          ],
        },
        user.id,
      ),
    ),
  });
};
