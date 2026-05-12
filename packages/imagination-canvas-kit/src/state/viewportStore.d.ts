import { type CanvasViewport } from "../contracts/index";
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
export declare const useViewportStore: import("zustand").UseBoundStore<
  Omit<import("zustand").StoreApi<ViewportState>, "setState" | "persist"> & {
    setState(
      partial:
        | ViewportState
        | Partial<ViewportState>
        | ((state: ViewportState) => ViewportState | Partial<ViewportState>),
      replace?: false | undefined,
    ): unknown;
    setState(
      state: ViewportState | ((state: ViewportState) => ViewportState),
      replace: true,
    ): unknown;
    persist: {
      setOptions: (
        options: Partial<
          import("zustand/middleware").PersistOptions<
            ViewportState,
            ViewportState,
            unknown
          >
        >,
      ) => void;
      clearStorage: () => void;
      rehydrate: () => Promise<void> | void;
      hasHydrated: () => boolean;
      onHydrate: (fn: (state: ViewportState) => void) => () => void;
      onFinishHydration: (fn: (state: ViewportState) => void) => () => void;
      getOptions: () => Partial<
        import("zustand/middleware").PersistOptions<
          ViewportState,
          ViewportState,
          unknown
        >
      >;
    };
  }
>;
export {};
//# sourceMappingURL=viewportStore.d.ts.map
