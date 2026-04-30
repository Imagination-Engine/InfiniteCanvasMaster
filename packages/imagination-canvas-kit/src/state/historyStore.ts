import { create } from "zustand";
import { CanvasObject } from "../contracts";

interface HistoryState {
  past: Record<string, CanvasObject>[];
  future: Record<string, CanvasObject>[];
  push: (objects: Record<string, CanvasObject>) => void;
  undo: (
    current: Record<string, CanvasObject>,
  ) => Record<string, CanvasObject> | null;
  redo: (
    current: Record<string, CanvasObject>,
  ) => Record<string, CanvasObject> | null;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  push: (objects) =>
    set((state) => ({
      past: [...state.past.slice(-50), objects], // Cap history at 50 steps
      future: [],
    })),
  undo: (current) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      future: [current, ...future],
    });

    return previous;
  },
  redo: (current) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, current],
      future: newFuture,
    });

    return next;
  },
}));
