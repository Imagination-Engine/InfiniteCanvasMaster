// @ts-nocheck
import { create } from "zustand";
export const useShellStore = create((set) => ({
  mode: "canvas",
  density: "comfortable",
  sessionContext: null,
  setMode: (mode) => set({ mode }),
  setDensity: (density) => set({ density }),
  setSessionContext: (sessionContext) => set({ sessionContext }),
}));
