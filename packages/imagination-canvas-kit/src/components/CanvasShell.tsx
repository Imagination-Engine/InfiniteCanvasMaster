import React from "react";
import { CanvasToolbar } from "./CanvasToolbar";
import { SideInspector } from "./SideInspector";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { ComponentRegistry } from "./ObjectRenderer";

export const CanvasShell: React.FC<{
  children: React.ReactNode;
  registry?: ComponentRegistry;
}> = ({ children, registry }) => {
  useKeyboardShortcuts();

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-brand-bg-page select-none"
      role="application"
      aria-label="Imagination Canvas"
    >
      <div className="absolute inset-0 z-0">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Forward registry to InfiniteViewport if that's the child
            return React.cloneElement(child, { registry } as any);
          }
          return child;
        })}
      </div>
      <CanvasToolbar />
      <SideInspector />
    </div>
  );
};
