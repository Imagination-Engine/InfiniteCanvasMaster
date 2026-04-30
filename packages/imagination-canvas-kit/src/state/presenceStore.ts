import { create } from "zustand";

export interface RemoteUser {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  lastActive: number;
}

interface PresenceState {
  users: Record<string, RemoteUser>;
  updateUser: (id: string, patch: Partial<RemoteUser>) => void;
  removeUser: (id: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  users: {},
  updateUser: (id, patch) =>
    set((state) => ({
      users: {
        ...state.users,
        [id]: state.users[id]
          ? { ...state.users[id], ...patch, lastActive: Date.now() }
          : {
              id,
              name: "Anonymous",
              color: "#ccc",
              x: 0,
              y: 0,
              lastActive: Date.now(),
              ...patch,
            },
      },
    })),
  removeUser: (id) =>
    set((state) => {
      const { [id]: _, ...remaining } = state.users;
      return { users: remaining };
    }),
}));
