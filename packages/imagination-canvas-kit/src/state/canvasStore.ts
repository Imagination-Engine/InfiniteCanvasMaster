import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CanvasObject, CanvasConnection } from "../contracts/index";

interface CanvasState {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  addConnection: (conn: CanvasConnection) => void;
  removeConnection: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      objects: [],
      connections: [],
      addObject: (obj) =>
        set((state) => ({ objects: [...state.objects, obj] })),
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...updates } : obj,
          ),
        })),
      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((obj) => obj.id !== id),
          connections: state.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id,
          ),
        })),
      addConnection: (conn) =>
        set((state) => ({ connections: [...state.connections, conn] })),
      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "iem-canvas-storage",
    },
  ),
);
