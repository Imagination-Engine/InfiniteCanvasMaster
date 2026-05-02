import { create } from "zustand";
import { CanvasMode } from "../components/CanvasShell";

interface ShellState {
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  mode: "canvas",
  setMode: (mode) => set({ mode }),
}));
