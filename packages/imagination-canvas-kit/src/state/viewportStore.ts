import { useSelectionStore } from "./selectionStore";
import { create } from "zustand";
import { usePresenceStore } from "./presenceStore";
import { persist } from "zustand/middleware";
import { type CanvasViewport, type CanvasObject } from "../contracts/index";
import { useCanvasStore } from "./canvasStore";

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
  followedUserId?: string;

  setCamera: (
    camera: Partial<Pick<CanvasViewport, "x" | "y" | "zoom">>,
  ) => void;
  pan: (dx: number, dy: number) => void;
  zoomTo: (zoom: number) => void;
  resize: (width: number, height: number) => void;
  setMode: (mode: ViewportMode) => void;
  setFollowedUser: (userId: string | undefined) => void;
  focusOn: (
    camera: Pick<CanvasViewport, "x" | "y" | "zoom">,
    reason: string,
  ) => void;
  returnToPrevious: () => void;

  fitToContent: (padding?: number) => void;
  zoomToSelection: (objectIds: string[], padding?: number) => void;
}

export const useViewportStore = create<ViewportState>()(
  persist(
    (set, get) => ({
      x: 0,
      y: 0,
      zoom: 1,
      mode: "free",
      followedUserId: undefined,

      setCamera: (camera) =>
        set((state) => {
          if (useSelectionStore.getState().editingId) return state;
          return { ...state, ...camera };
        }),
      pan: (dx, dy) =>
        set((state) => {
          if (useSelectionStore.getState().editingId) return state;
          // Break follow mode on manual pan
          return {
            x: state.x + dx,
            y: state.y + dy,
            mode: state.mode === "follow" ? "free" : state.mode,
            followedUserId:
              state.mode === "follow" ? undefined : state.followedUserId,
          };
        }),
      zoomTo: (zoom) =>
        set((state) => ({
          zoom,
          // Break follow mode on manual zoom
          mode: state.mode === "follow" ? "free" : state.mode,
          followedUserId:
            state.mode === "follow" ? undefined : state.followedUserId,
        })),
      resize: (width, height) => set({ width, height }),
      setMode: (mode) => set({ mode }),

      setFollowedUser: (userId) => {
        if (!userId) {
          set({ mode: "free", followedUserId: undefined });
          return;
        }

        const user = usePresenceStore.getState().users[userId];

        if (user && user.viewport) {
          set({
            mode: "follow",
            followedUserId: userId,
            x: user.viewport.x,
            y: user.viewport.y,
            zoom: user.viewport.zoom,
          });
        } else {
          set({ mode: "follow", followedUserId: userId });
        }
      },

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

      fitToContent: (padding = 40) => {
        const { objects } = useCanvasStore.getState();
        if (Object.keys(objects).length === 0) {
          set({ x: 0, y: 0, zoom: 1 });
          return;
        }
        get().zoomToSelection(
          Object.values(objects).map((o: any) => o.id),
          padding,
        );
      },

      zoomToSelection: (objectIds, padding = 40) => {
        const { objects } = useCanvasStore.getState();
        const selected = Object.values(objects).filter((o: any) =>
          objectIds.includes(o.id),
        );
        if (selected.length === 0) return;

        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        selected.forEach((o) => {
          minX = Math.min(minX, o.x);
          minY = Math.min(minY, o.y);
          maxX = Math.max(maxX, o.x + o.width);
          maxY = Math.max(maxY, o.y + o.height);
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const viewportWidth = get().width || 1000;
        const viewportHeight = get().height || 1000;

        const zoomX = (viewportWidth - padding * 2) / width;
        const zoomY = (viewportHeight - padding * 2) / height;
        const nextZoom = Math.min(Math.min(zoomX, zoomY), 2); // Max zoom 2x for auto fit

        set({
          zoom: nextZoom,
          x: minX + width / 2 - viewportWidth / 2 / nextZoom,
          y: minY + height / 2 - viewportHeight / 2 / nextZoom,
        });
      },
    }),
    {
      name: "iem-viewport-storage",
    },
  ),
);
