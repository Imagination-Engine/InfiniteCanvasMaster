import {
  CanvasObject,
  CanvasConnection,
  CanvasBinding,
} from "../contracts/index";
interface CanvasState {
  objects: Record<string, CanvasObject>;
  connections: CanvasConnection[];
  bindings: CanvasBinding[];
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  addConnection: (conn: CanvasConnection) => void;
  updateConnection: (id: string, updates: Partial<CanvasConnection>) => void;
  removeConnection: (id: string) => void;
  addBinding: (binding: CanvasBinding) => void;
  updateBinding: (id: string, updates: Partial<CanvasBinding>) => void;
  removeBinding: (id: string) => void;
  moveObjects: (ids: string[], deltaX: number, deltaY: number) => void;
  resizeObject: (id: string, deltaWidth: number, deltaHeight: number) => void;
  updateZOrder: (
    id: string,
    action: "front" | "back" | "forward" | "backward",
  ) => void;
}
export declare const useCanvasStore: import("zustand").UseBoundStore<
  Omit<import("zustand").StoreApi<CanvasState>, "setState" | "persist"> & {
    setState(
      partial:
        | CanvasState
        | Partial<CanvasState>
        | ((state: CanvasState) => CanvasState | Partial<CanvasState>),
      replace?: false | undefined,
    ): unknown;
    setState(
      state: CanvasState | ((state: CanvasState) => CanvasState),
      replace: true,
    ): unknown;
    persist: {
      setOptions: (
        options: Partial<
          import("zustand/middleware").PersistOptions<
            CanvasState,
            CanvasState,
            unknown
          >
        >,
      ) => void;
      clearStorage: () => void;
      rehydrate: () => Promise<void> | void;
      hasHydrated: () => boolean;
      onHydrate: (fn: (state: CanvasState) => void) => () => void;
      onFinishHydration: (fn: (state: CanvasState) => void) => () => void;
      getOptions: () => Partial<
        import("zustand/middleware").PersistOptions<
          CanvasState,
          CanvasState,
          unknown
        >
      >;
    };
  }
>;
export {};
//# sourceMappingURL=canvasStore.d.ts.map
