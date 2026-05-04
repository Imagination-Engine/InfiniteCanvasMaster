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
  moveObjects: (ids: string[], deltaX: number, deltaY: number) => void;
  resizeObject: (id: string, deltaWidth: number, deltaHeight: number) => void;
  updateZOrder: (
    id: string,
    action: "front" | "back" | "forward" | "backward",
  ) => void;
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
      moveObjects: (ids, deltaX, deltaY) =>
        set((state) => {
          // Find all bindings targeting these moving objects
          const boundObjectIds = state.bindings
            .filter((b) => ids.includes(b.targetId))
            .map((b) => b.sourceId);

          const allMovingIds = [...ids, ...boundObjectIds];

          return {
            objects: state.objects.map((obj) => {
              if (
                allMovingIds.includes(obj.id) &&
                obj.capabilities?.canMove !== false
              ) {
                return { ...obj, x: obj.x + deltaX, y: obj.y + deltaY };
              }
              return obj;
            }),
          };
        }),

      resizeObject: (id, deltaWidth, deltaHeight) =>
        set((state) => ({
          objects: state.objects.map((obj) => {
            if (obj.id === id && obj.capabilities?.canResize !== false) {
              return {
                ...obj,
                width: Math.max(10, obj.width + deltaWidth),
                height: Math.max(10, obj.height + deltaHeight),
              };
            }
            return obj;
          }),
        })),

      updateZOrder: (id, action) =>
        set((state) => {
          const sortedObjects = [...state.objects].sort(
            (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
          );
          const index = sortedObjects.findIndex((obj) => obj.id === id);
          if (index === -1) return state;

          const newSorted = [...sortedObjects];
          const [removed] = newSorted.splice(index, 1);

          if (action === "front") {
            newSorted.push(removed);
          } else if (action === "back") {
            newSorted.unshift(removed);
          } else if (action === "forward") {
            newSorted.splice(Math.min(newSorted.length, index + 1), 0, removed);
          } else if (action === "backward") {
            newSorted.splice(Math.max(0, index - 1), 0, removed);
          }

          // Re-assign z-indexes based on new order
          const updatedObjects = state.objects.map((obj) => {
            const newIndex = newSorted.findIndex((so) => so.id === obj.id);
            return { ...obj, zIndex: newIndex };
          });

          return { objects: updatedObjects };
        }),

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
