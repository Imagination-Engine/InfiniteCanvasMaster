// @ts-nocheck
import { create } from "zustand";
export const useExpansionStore = create((set) => ({
  activeExpansionId: null,
  activeMode: "none",
  setExpanded: (id, mode) =>
    set({
      activeExpansionId: id,
      activeMode: mode,
    }),
  clearExpanded: () =>
    set({
      activeExpansionId: null,
      activeMode: "none",
    }),
}));
