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
  setMode: (mode: CanvasMode) => void;
  setDensity: (density: DensityMode) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  mode: "canvas",
  density: "comfortable",
  setMode: (mode) => set({ mode }),
  setDensity: (density) => set({ density }),
}));
