import React from "react";
import { CanvasToolbar } from "./CanvasToolbar";
import { SideInspector } from "./SideInspector";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export const CanvasShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useKeyboardShortcuts();

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-brand-bg-page select-none"
      role="application"
      aria-label="Imagination Canvas"
    >
      <div className="absolute inset-0 z-0">{children}</div>
      <CanvasToolbar />
      <SideInspector />
    </div>
  );
};
