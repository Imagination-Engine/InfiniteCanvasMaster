// @ts-nocheck
import { create } from "zustand";
export const usePresenceStore = create((set) => ({
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
