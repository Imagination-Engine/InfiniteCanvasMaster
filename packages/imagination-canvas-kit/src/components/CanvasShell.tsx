// @ts-nocheck
import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useShellStore } from "../state/shellStore";

import { BlockLibraryDrawer } from "./BlockLibraryDrawer";
import { ImmersiveBlockModal } from "./ImmersiveBlockModal";
import { FloatingOrchestratorChat } from "./FloatingOrchestratorChat";

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
export const CanvasShell: React.FC<CanvasShellProps> = ({
  canvasId = "default",
  mode: controlledMode,
  sessionContext,
  className,
  children,
}) => {
  const storeMode = useShellStore((state) => state.mode);
  const setSessionContext = useShellStore((state) => state.setSessionContext);
  const mode = controlledMode ?? storeMode;

  React.useEffect(() => {
    if (sessionContext) {
      setSessionContext(sessionContext);
    }
  }, [sessionContext, setSessionContext]);

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
      <BlockLibraryDrawer />
      {children}
      <ImmersiveBlockModal />
      <FloatingOrchestratorChat />
    </div>
  );
};
