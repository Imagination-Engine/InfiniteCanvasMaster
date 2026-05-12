interface LibraryState {
  customBlocks: any[];
  loadCustomBlocks: () => Promise<void>;
  addCustomBlock: (block: any) => Promise<void>;
}
export declare const useLibraryStore: import("zustand").UseBoundStore<
  Omit<import("zustand").StoreApi<LibraryState>, "setState" | "persist"> & {
    setState(
      partial:
        | LibraryState
        | Partial<LibraryState>
        | ((state: LibraryState) => LibraryState | Partial<LibraryState>),
      replace?: false | undefined,
    ): unknown;
    setState(
      state: LibraryState | ((state: LibraryState) => LibraryState),
      replace: true,
    ): unknown;
    persist: {
      setOptions: (
        options: Partial<
          import("zustand/middleware").PersistOptions<
            LibraryState,
            LibraryState,
            unknown
          >
        >,
      ) => void;
      clearStorage: () => void;
      rehydrate: () => Promise<void> | void;
      hasHydrated: () => boolean;
      onHydrate: (fn: (state: LibraryState) => void) => () => void;
      onFinishHydration: (fn: (state: LibraryState) => void) => () => void;
      getOptions: () => Partial<
        import("zustand/middleware").PersistOptions<
          LibraryState,
          LibraryState,
          unknown
        >
      >;
    };
  }
>;
export {};
//# sourceMappingURL=libraryStore.d.ts.map
