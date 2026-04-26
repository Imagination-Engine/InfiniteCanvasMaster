import { create } from "zustand";

export type ExpansionMode =
  | "none"
  | "peek"
  | "side-panel"
  | "modal"
  | "focus"
  | "fullscreen";

interface ExpansionState {
  activeId: string | null;
  mode: ExpansionMode;
  setExpansion: (id: string | null, mode: ExpansionMode) => void;
}

export const useExpansionStore = create<ExpansionState>((set) => ({
  activeId: null,
  mode: "none",
  setExpansion: (id, mode) => set({ activeId: id, mode }),
}));
