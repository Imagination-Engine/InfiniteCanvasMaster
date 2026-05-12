import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useShellStore } from "../state/shellStore";
import { BlockLibraryDrawer } from "./BlockLibraryDrawer";
import { ImmersiveBlockModal } from "./ImmersiveBlockModal";
import { FloatingOrchestratorChat } from "./FloatingOrchestratorChat";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
/**
 * Root wrapper for the Imagination Canvas shell.
 * Manages layout modes and Z-index layering.
 */
export const CanvasShell = ({
  canvasId = "default",
  mode: controlledMode,
  sessionContext,
  className,
  onRunGraph,
  isRunning,
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
  return _jsxs("div", {
    id: `canvas-shell-${canvasId}`,
    "data-testid": "canvas-shell",
    className: cn(
      "relative w-full h-full overflow-hidden bg-brand-bg-page text-brand-text-primary",
      `mode-${mode}`,
      className,
    ),
    children: [
      children,
      _jsx(BlockLibraryDrawer, { onRunGraph, isRunning }),
      _jsx(ImmersiveBlockModal, {}),
      _jsx(FloatingOrchestratorChat, {}),
    ],
  });
};
