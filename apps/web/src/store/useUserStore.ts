import { create } from 'zustand';

interface UserState {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
}));
