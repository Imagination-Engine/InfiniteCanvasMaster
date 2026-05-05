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
  activeProjectId: string | null;
  activeMode: ExpansionMode;

  setExpanded: (id: string, mode: ExpansionMode, projectId?: string) => void;
  clearExpanded: () => void;
}

export const useExpansionStore = create<ExpansionState>((set) => ({
  activeExpansionId: null,
  activeProjectId: null,
  activeMode: "none",

  setExpanded: (id, mode, projectId) =>
    set({
      activeExpansionId: id,
      activeProjectId: projectId || null,
      activeMode: mode,
    }),

  clearExpanded: () =>
    set({
      activeExpansionId: null,
      activeProjectId: null,
      activeMode: "none",
    }),
}));
