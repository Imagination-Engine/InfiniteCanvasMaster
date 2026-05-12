// @ts-nocheck
import { getIdsInRect } from "../utils/math";
import { create } from "zustand";
const getSelectionMode = (ids) => {
  if (ids.length === 0) return "none";
  if (ids.length === 1) return "single";
  return "multi";
};
export const useSelectionStore = create((set) => ({
  selectedIds: [],
  hoveredId: null,
  selectionMode: "none",
  editingId: null,
  select: (id, options = {}) =>
    set((state) => {
      let newSelectedIds;
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
