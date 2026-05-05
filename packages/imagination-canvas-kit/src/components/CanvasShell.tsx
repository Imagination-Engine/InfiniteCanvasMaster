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
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan z-[10000] shadow-[0_0_20px_rgba(0,194,255,1)]" />
      <div className="absolute top-4 right-4 z-[10001] bg-brand-cyan text-black px-4 py-2 rounded-full font-black uppercase text-[10px] shadow-2xl">
        Imagination Engine: Rescue Pass Active
      </div>
      <BlockLibraryDrawer />
      <ImmersiveBlockModal />
      {children}
      <FloatingOrchestratorChat />
    </div>
  );
};
