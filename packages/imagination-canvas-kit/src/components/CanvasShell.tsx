import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useShellStore } from "../state/shellStore";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CanvasMode =
  | "canvas"
  | "focus"
  | "presentation"
  | "split"
  | "immersive";

export interface CanvasShellProps {
  canvasId: string;
  mode?: CanvasMode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Root wrapper for the Imagination Canvas shell.
 * Manages layout modes and Z-index layering.
 */
export const CanvasShell: React.FC<CanvasShellProps> = ({
  canvasId,
  mode: controlledMode,
  className,
  children,
}) => {
  const storeMode = useShellStore((state) => state.mode);
  const mode = controlledMode ?? storeMode;

  return (
    <div
      id={`canvas-shell-${canvasId}`}
      data-testid="canvas-shell"
      className={cn(
        "relative w-full h-full overflow-hidden bg-brand-bg-page text-brand-text-primary",
        `mode-${mode}`,
        className,
      )}
    >
      {children}
    </div>
  );
};
