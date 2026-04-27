import { create } from "zustand";
import { CanvasObject } from "../contracts";

interface CanvasState {
  objects: Record<string, CanvasObject>;
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  batchUpdateObjects: (patches: Record<string, Partial<CanvasObject>>) => void;
  removeObject: (id: string) => void;
}

/**
 * Global Canvas Store (Zustand)
 * Manages the state of all spatial objects on the Command Surface.
 */
export const useCanvasStore = create<CanvasState>((set) => ({
  objects: {},
  addObject: (obj) =>
    set((state) => ({
      objects: { ...state.objects, [obj.id]: obj },
    })),
  updateObject: (id, patch) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: state.objects[id]
          ? { ...state.objects[id], ...patch }
          : state.objects[id],
      },
    })),
  batchUpdateObjects: (patches) =>
    set((state) => {
      const newObjects = { ...state.objects };
      for (const [id, patch] of Object.entries(patches)) {
        if (newObjects[id]) {
          newObjects[id] = { ...newObjects[id], ...patch };
        }
      }
      return { objects: newObjects };
    }),
  removeObject: (id) =>
    set((state) => {
      const { [id]: _, ...remaining } = state.objects;
      return { objects: remaining };
    }),
}));
