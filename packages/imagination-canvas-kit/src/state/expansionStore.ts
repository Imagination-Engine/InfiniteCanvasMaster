// @ts-nocheck
import { create } from "zustand";

export type ExpansionMode =
  | "none"
  | "peek"
  | "inline-expanded"
  | "side-panel"
  | "focus-region"
  | "fullscreen"
  | "route"
  | "presentation";

interface ExpansionState {
  activeExpansionId: string | null;
  activeMode: ExpansionMode;

  setExpanded: (id: string, mode: ExpansionMode) => void;
  clearExpanded: () => void;
}

export const useExpansionStore = create<ExpansionState>((set) => ({
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
