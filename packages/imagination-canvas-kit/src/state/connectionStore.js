// @ts-nocheck
import { create } from "zustand";
export const useConnectionStore = create((set) => ({
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
}));
