import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CanvasViewport } from "../contracts/index";

export type ViewportMode =
  | "free"
  | "focus"
  | "presentation"
  | "follow"
  | "locked";

interface ViewportPrevious {
  x: number;
  y: number;
  zoom: number;
  reason: string;
}

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
  width?: number;
  height?: number;
  mode: ViewportMode;
  previous?: ViewportPrevious;

  setCamera: (
    camera: Partial<Pick<CanvasViewport, "x" | "y" | "zoom">>,
  ) => void;
  pan: (dx: number, dy: number) => void;
  zoomTo: (zoom: number) => void;
  resize: (width: number, height: number) => void;
  setMode: (mode: ViewportMode) => void;
  focusOn: (
    camera: Pick<CanvasViewport, "x" | "y" | "zoom">,
    reason: string,
  ) => void;
  returnToPrevious: () => void;
}

export const useViewportStore = create<ViewportState>()(
  persist(
    (set, get) => ({
      x: 0,
      y: 0,
      zoom: 1,
      mode: "free",

      setCamera: (camera) => set((state) => ({ ...state, ...camera })),
      pan: (dx, dy) => set((state) => ({ x: state.x + dx, y: state.y + dy })),
      zoomTo: (zoom) => set({ zoom }),
      resize: (width, height) => set({ width, height }),
      setMode: (mode) => set({ mode }),

      focusOn: (camera, reason) => {
        const { x, y, zoom } = get();
        set({
          ...camera,
          mode: "focus",
          previous: { x, y, zoom, reason },
        });
      },

      returnToPrevious: () => {
        const { previous } = get();
        if (previous) {
          set({
            x: previous.x,
            y: previous.y,
            zoom: previous.zoom,
            mode: "free",
            previous: undefined,
          });
        }
      },
    }),
    {
      name: "iem-viewport-storage",
    },
  ),
);
