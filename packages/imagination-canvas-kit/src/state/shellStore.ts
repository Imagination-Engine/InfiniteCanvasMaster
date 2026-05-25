// @ts-nocheck
import { create } from "zustand";
import type { CanvasMode } from "../components/CanvasShell";

export type DensityMode =
  | "comfortable"
  | "compact"
  | "presentation"
  | "immersive";

interface ShellState {
  mode: CanvasMode;
  density: DensityMode;
  canvasId: string | null;
  sessionContext: string | null;
  setMode: (mode: CanvasMode) => void;
  setDensity: (density: DensityMode) => void;
  setCanvasId: (id: string | null) => void;
  setSessionContext: (context: string | null) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  mode: "canvas",
  density: "comfortable",
  canvasId: null,
  sessionContext: null,
  setMode: (mode) => set({ mode }),
  setDensity: (density) => set({ density }),
  setCanvasId: (canvasId) => set({ canvasId }),
  setSessionContext: (sessionContext) => set({ sessionContext }),
}));
