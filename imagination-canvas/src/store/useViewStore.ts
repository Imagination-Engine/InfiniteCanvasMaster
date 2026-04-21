import { create } from 'zustand';

export type ViewMode = 'chat' | 'canvas' | 'dual';

interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewMode: 'chat',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
