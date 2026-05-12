import React from "react";
export type CanvasMode =
  | "canvas"
  | "focus"
  | "presentation"
  | "split"
  | "immersive";
export interface CanvasShellProps {
  canvasId?: string;
  mode?: CanvasMode;
  sessionContext?: string;
  className?: string;
  children: React.ReactNode;
}
/**
 * Root wrapper for the Imagination Canvas shell.
 * Manages layout modes and Z-index layering.
 */
export declare const CanvasShell: React.FC<CanvasShellProps>;
//# sourceMappingURL=CanvasShell.d.ts.map
