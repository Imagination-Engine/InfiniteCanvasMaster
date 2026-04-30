import { create } from "zustand";
import { CanvasViewport } from "../contracts";

interface ViewportState {
  viewport: CanvasViewport;
  updateViewport: (patch: Partial<CanvasViewport>) => void;
  resetViewport: () => void;
}

const DEFAULT_VIEWPORT: CanvasViewport = {
  id: "default",
  x: 0,
  y: 0,
  zoom: 1,
  mode: "free",
};

export const useViewportStore = create<ViewportState>((set) => ({
  viewport: DEFAULT_VIEWPORT,
  updateViewport: (patch) =>
    set((state) => ({
      viewport: { ...state.viewport, ...patch },
    })),
  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),
}));
