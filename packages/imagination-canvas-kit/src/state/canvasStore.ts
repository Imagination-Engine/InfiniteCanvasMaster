import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CanvasObject,
  CanvasConnection,
  CanvasBinding,
} from "../contracts/index";

interface CanvasState {
  objects: CanvasObject[];
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
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      objects: [],
      connections: [],
      bindings: [],

      addObject: (obj) =>
        set((state) => ({ objects: [...state.objects, obj] })),
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...updates } : (obj as any),
          ),
        })),
      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((obj) => obj.id !== id),
          connections: state.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id,
          ),
          bindings: state.bindings.filter((b) => b.targetId !== id),
        })),

      addConnection: (conn) =>
        set((state) => ({ connections: [...state.connections, conn] })),
      updateConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        })),

      addBinding: (binding) =>
        set((state) => ({ bindings: [...state.bindings, binding] })),
      updateBinding: (id, updates) =>
        set((state) => ({
          bindings: state.bindings.map((b) =>
            b.id === id ? { ...b, ...updates } : b,
          ),
        })),
      removeBinding: (id) =>
        set((state) => ({
          bindings: state.bindings.filter((b) => b.id !== id),
        })),
    }),
    {
      name: "iem-canvas-storage",
    },
  ),
);
