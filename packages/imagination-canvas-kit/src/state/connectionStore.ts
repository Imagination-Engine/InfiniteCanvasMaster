import { create } from "zustand";

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

interface ConnectionState {
  connections: Record<string, Connection>;
  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;
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
}));
