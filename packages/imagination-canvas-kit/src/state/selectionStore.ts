// @ts-nocheck
import { type Rect, getIdsInRect, type BoundingBoxed } from "../utils/math";
import { create } from "zustand";

export type SelectionMode =
  | "none"
  | "single"
  | "multi"
  | "group"
  | "region"
  | "semantic";

interface SelectionOptions {
  additive?: boolean;
  toggle?: boolean;
}

interface SelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  selectionMode: SelectionMode;
  editingId: string | null;

  select: (id: string, options?: SelectionOptions) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setEditing: (id: string | null) => void;
  selectInRect: (rect: Rect, objects: BoundingBoxed[]) => void;
}

const getSelectionMode = (ids: string[]): SelectionMode => {
  if (ids.length === 0) return "none";
  if (ids.length === 1) return "single";
  return "multi";
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  hoveredId: null,
  selectionMode: "none",
  editingId: null,

  select: (id, options = {}) =>
    set((state) => {
      let newSelectedIds: string[];

      if (options.toggle) {
        if (state.selectedIds.includes(id)) {
          newSelectedIds = state.selectedIds.filter(
            (selectedId) => selectedId !== id,
          );
        } else {
          newSelectedIds = [...state.selectedIds, id];
        }
      } else if (options.additive) {
        if (state.selectedIds.includes(id)) {
          newSelectedIds = state.selectedIds;
        } else {
          newSelectedIds = [...state.selectedIds, id];
        }
      } else {
        newSelectedIds = [id];
      }

      return {
        selectedIds: newSelectedIds,
        selectionMode: getSelectionMode(newSelectedIds),
      };
    }),

  setSelection: (ids) =>
    set({
      selectedIds: ids,
      selectionMode: getSelectionMode(ids),
    }),

  clearSelection: () =>
    set({
      selectedIds: [],
      selectionMode: "none",
      editingId: null,
    }),

  setHovered: (id) => set({ hoveredId: id }),

  setSelectionMode: (mode) => set({ selectionMode: mode }),

  setEditing: (id) => set({ editingId: id }),

  selectInRect: (rect, objects) =>
    set(() => {
      const ids = getIdsInRect(rect, objects);
      return {
        selectedIds: ids,
        selectionMode: getSelectionMode(ids),
      };
    }),
}));
