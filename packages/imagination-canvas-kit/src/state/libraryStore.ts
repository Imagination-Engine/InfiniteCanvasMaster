// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { blockRegistry } from "@iem/core";

interface LibraryState {
  customBlocks: any[];
  loadCustomBlocks: () => Promise<void>;
  addCustomBlock: (block: any) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      customBlocks: [],

      loadCustomBlocks: async () => {
        try {
          const response = await fetch("/api/blocks/library");
          if (response.ok) {
            const data = await response.json();
            set({ customBlocks: data.blocks || [] });

            // Register to core registry as well so other components see them
            (data.blocks || []).forEach((block) => {
              blockRegistry.register({
                ...block,
                category: "Custom",
              });
            });
          }
        } catch (err) {
          console.error("Failed to load custom blocks", err);
        }
      },

      addCustomBlock: async (block) => {
        // Optimistic update
        const newBlocks = [...get().customBlocks, block];
        set({ customBlocks: newBlocks });

        blockRegistry.register({
          ...block,
          category: "Custom",
        });
      },
    }),
    {
      name: "iem-library-storage",
    },
  ),
);
