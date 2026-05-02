import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CanvasViewport } from "../contracts/index";

interface ViewportState extends Omit<CanvasViewport, "width" | "height"> {
  width?: number;
  height?: number;
  setCamera: (camera: Partial<CanvasViewport>) => void;
  pan: (dx: number, dy: number) => void;
  zoomTo: (zoom: number) => void;
  resize: (width: number, height: number) => void;
}

export const useViewportStore = create<ViewportState>()(
  persist(
    (set) => ({
      x: 0,
      y: 0,
      zoom: 1,
      setCamera: (camera) => set((state) => ({ ...state, ...camera })),
      pan: (dx, dy) => set((state) => ({ x: state.x + dx, y: state.y + dy })),
      zoomTo: (zoom) => set({ zoom }),
      resize: (width, height) => set({ width, height }),
    }),
    {
      name: "iem-viewport-storage",
    },
  ),
);
