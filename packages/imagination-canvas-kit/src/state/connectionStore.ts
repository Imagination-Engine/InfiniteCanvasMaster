// @ts-nocheck
import { create } from "zustand";

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface DraftConnection {
  fromId: string;
  x: number;
  y: number;
}

interface ConnectionState {
  connections: Record<string, Connection>;
  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;
  draftConnection: DraftConnection | null;
  setDraftConnection: (draft: DraftConnection | null) => void;
  updateDraftPosition: (x: number, y: number) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: {},
  addConnection: (conn) =>
    set((state) => ({
      connections: { ...state.connections, [conn.id]: conn },
    })),
  removeConnection: (id) =>
    set((state) => {
      const { [id]: _, ...remaining } = state.connections;
      return { connections: remaining };
    }),
  draftConnection: null,
  setDraftConnection: (draft) => set({ draftConnection: draft }),
  updateDraftPosition: (x, y) =>
    set((state) => {
      if (!state.draftConnection) return state;
      return {
        draftConnection: {
          ...state.draftConnection,
          x,
          y,
        },
      };
    }),
}));
