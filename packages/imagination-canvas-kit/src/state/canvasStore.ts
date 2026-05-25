// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CanvasObject,
  CanvasConnection,
  CanvasBinding,
} from "../contracts/index";

interface CanvasState {
  objects: Record<string, CanvasObject>;
  connections: CanvasConnection[];
  bindings: CanvasBinding[];
  _hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  patchObjectMetadata: (id: string, patch: Record<string, unknown>) => void;
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

/** Routed into metadata.inputs / metadata.outputs only — never top-level metadata. */
const METADATA_PATCH_ROUTED_KEYS = [
  "imageUrl",
  "thumbnailUrl",
  "clipUrl",
  "fileUrl",
  "audioUrl",
  "prompt",
] as const;

const OUTPUT_MEDIA_KEYS = METADATA_PATCH_ROUTED_KEYS.filter(
  (k) => k !== "prompt",
);

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      objects: {},
      connections: [],
      bindings: [],
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      addObject: (obj) =>
        set((state) => ({ objects: { ...state.objects, [obj.id]: obj } })),

      patchObjectMetadata: (id, patch) =>
        set((state) => {
          const existing = state.objects[id];
          if (!existing) return state;
          const meta = existing.metadata ?? {};
          const prevInputs =
            (meta.inputs as Record<string, unknown> | undefined) ?? {};
          const prevOutputs =
            (meta.outputs as Record<string, unknown> | undefined) ?? {};

          const patchRecord = patch as Record<string, unknown>;
          const patchInputs =
            patchRecord.inputs && typeof patchRecord.inputs === "object"
              ? (patchRecord.inputs as Record<string, unknown>)
              : {};
          const patchOutputs =
            patchRecord.outputs && typeof patchRecord.outputs === "object"
              ? (patchRecord.outputs as Record<string, unknown>)
              : {};

          const outputScalars: Record<string, unknown> = {};
          for (const key of OUTPUT_MEDIA_KEYS) {
            if (typeof patchRecord[key] === "string") {
              outputScalars[key] = patchRecord[key];
            }
          }

          const nextOutputs = {
            ...prevOutputs,
            ...patchOutputs,
            ...outputScalars,
          };
          const nextInputs = { ...prevInputs, ...patchInputs };
          if (typeof patchRecord.imageUrl === "string") {
            nextInputs.imageUrl = patchRecord.imageUrl;
            nextOutputs.imageUrl = patchRecord.imageUrl;
          }
          if (typeof patchRecord.prompt === "string") {
            nextInputs.prompt = patchRecord.prompt;
          }

          const {
            inputs: _inputs,
            outputs: _outputs,
            imageUrl: _imageUrl,
            thumbnailUrl: _thumbnailUrl,
            clipUrl: _clipUrl,
            fileUrl: _fileUrl,
            audioUrl: _audioUrl,
            prompt: _prompt,
            ...metaPatch
          } = patchRecord;

          const nextMetadata: Record<string, unknown> = {
            ...meta,
            ...metaPatch,
            inputs: nextInputs,
            outputs: nextOutputs,
          };
          for (const key of METADATA_PATCH_ROUTED_KEYS) {
            delete nextMetadata[key];
          }

          return {
            objects: {
              ...state.objects,
              [id]: {
                ...existing,
                metadata: nextMetadata,
              },
            },
          };
        }),

      updateObject: (id, updates) =>
        set((state) => {
          if (!state.objects[id]) return state;
          const existing = state.objects[id];
          let next = { ...existing, ...updates } as CanvasObject;
          if (updates.metadata) {
            const prevMeta = existing.metadata ?? {};
            const nextMeta = updates.metadata;
            next = {
              ...next,
              metadata: {
                ...prevMeta,
                ...nextMeta,
                inputs: {
                  ...(prevMeta.inputs as object),
                  ...(nextMeta.inputs as object),
                },
                outputs: {
                  ...(prevMeta.outputs as object),
                  ...(nextMeta.outputs as object),
                },
                studioPayload: nextMeta.studioPayload ?? prevMeta.studioPayload,
              },
            };
          }
          return {
            objects: {
              ...state.objects,
              [id]: next,
            },
          };
        }),
      removeObject: (id) =>
        set((state) => {
          const newObjects = { ...state.objects };
          delete newObjects[id];
          return {
            objects: newObjects,
            connections: state.connections.filter(
              (c) => c.sourceId !== id && c.targetId !== id,
            ),
            bindings: state.bindings.filter((b) => b.targetId !== id),
          };
        }),

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
            .map((b) => b.actorId);

          const allMovingIds = [...ids, ...boundObjectIds];

          return {
            objects: Object.values(state.objects).reduce(
              (acc, obj) => {
                if (
                  allMovingIds.includes(obj.id) &&
                  obj.capabilities?.canMove !== false
                ) {
                  acc[obj.id] = {
                    ...obj,
                    x: obj.x + deltaX,
                    y: obj.y + deltaY,
                  };
                } else {
                  acc[obj.id] = obj;
                }
                return acc;
              },
              {} as Record<string, CanvasObject>,
            ),
          };
        }),

      resizeObject: (id, deltaWidth, deltaHeight) =>
        set((state) => {
          const obj = state.objects[id];
          if (!obj || obj.capabilities?.canResize === false) return state;
          return {
            objects: {
              ...state.objects,
              [id]: {
                ...obj,
                width: Math.max(10, obj.width + deltaWidth),
                height: Math.max(10, obj.height + deltaHeight),
              },
            },
          };
        }),

      updateZOrder: (id, action) =>
        set((state) => {
          const sortedObjects = Object.values(state.objects).sort(
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

          const updatedObjects: Record<string, CanvasObject> = {};
          Object.values(state.objects).forEach((obj) => {
            const newIndex = newSorted.findIndex((so) => so.id === obj.id);
            updatedObjects[obj.id] = { ...obj, zIndex: newIndex };
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
