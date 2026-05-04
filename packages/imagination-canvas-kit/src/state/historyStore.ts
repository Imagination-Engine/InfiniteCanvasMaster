// @ts-nocheck
import { create } from "zustand";
import { CanvasObject, CanvasConnection, CanvasBinding } from "../contracts";
import { useCanvasStore } from "./canvasStore";

export interface CanvasStateSnapshot {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  bindings: CanvasBinding[];
}

export interface CanvasMutation {
  type: "object.created" | "objects.moved" | "agent.applied" | string;
  description?: string;
  before: CanvasStateSnapshot;
  after: CanvasStateSnapshot;
}

export interface CanvasSnapshot {
  id: string;
  name: string;
  timestamp: number;
  state: CanvasStateSnapshot;
}

interface HistoryState {
  past: CanvasMutation[];
  future: CanvasMutation[];
  snapshots: Record<string, CanvasSnapshot>;
  pushMutation: (mutation: CanvasMutation) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  createSnapshot: (name: string) => string;
  restoreSnapshot: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  snapshots: {},
  pushMutation: (mutation) =>
    set((state) => ({
      past: [...state.past.slice(-49), mutation], // Cap history at 50 steps
      future: [],
      snapshots: {},
    })),
  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const previousMutation = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    // Apply the 'before' state to canvasStore
    useCanvasStore.setState({
      objects: previousMutation.before.objects,
      connections: previousMutation.before.connections,
      bindings: previousMutation.before.bindings,
    });

    set({
      past: newPast,
      future: [previousMutation, ...future],
    });
  },
  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const nextMutation = future[0];
    const newFuture = future.slice(1);

    // Apply the 'after' state to canvasStore
    useCanvasStore.setState({
      objects: nextMutation.after.objects,
      connections: nextMutation.after.connections,
      bindings: nextMutation.after.bindings,
    });

    set({
      past: [...past, nextMutation],
      future: newFuture,
    });
  },
  clear: () => set({ past: [], future: [] }),
  createSnapshot: (name: string) => {
    const id = `snap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const currentState = useCanvasStore.getState();
    const snapshot: CanvasSnapshot = {
      id,
      name,
      timestamp: Date.now(),
      state: {
        objects: [...currentState.objects],
        connections: [...currentState.connections],
        bindings: [...currentState.bindings],
      },
    };

    set((state) => ({
      snapshots: { ...state.snapshots, [id]: snapshot },
    }));

    return id;
  },
  restoreSnapshot: (id: string) => {
    const { snapshots } = get();
    const snapshot = snapshots[id];

    if (!snapshot) {
      throw new Error("Snapshot not found");
    }

    useCanvasStore.setState({
      objects: [...snapshot.state.objects],
      connections: [...snapshot.state.connections],
      bindings: [...snapshot.state.bindings],
    });
  },
}));
