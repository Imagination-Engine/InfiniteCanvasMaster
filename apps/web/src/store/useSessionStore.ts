import { create } from 'zustand';

interface SessionState {
  hasCanvas: boolean;
  isCanvasVisible: boolean;
  setHasCanvas: (has: boolean) => void;
  setCanvasVisible: (visible: boolean) => void;
  toggleCanvas: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  hasCanvas: false,
  isCanvasVisible: false,
  setHasCanvas: (has) => set({ hasCanvas: has }),
  setCanvasVisible: (visible) => set({ isCanvasVisible: visible }),
  toggleCanvas: () => set((state) => ({ isCanvasVisible: !state.isCanvasVisible })),
}));
