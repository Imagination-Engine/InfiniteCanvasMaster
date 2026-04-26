import { create } from "zustand";
import { CanvasObject } from "../contracts";

interface CanvasState {
  objects: Record<string, CanvasObject>;
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
}

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
  removeObject: (id) =>
    set((state) => {
      const { [id]: _, ...remaining } = state.objects;
      return { objects: remaining };
    }),
}));
