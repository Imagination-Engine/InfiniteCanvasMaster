export type ExpansionMode =
  | "none"
  | "peek"
  | "inline-expanded"
  | "side-panel"
  | "focus-region"
  | "fullscreen"
  | "route"
  | "presentation";
interface ExpansionState {
  activeExpansionId: string | null;
  activeMode: ExpansionMode;
  setExpanded: (id: string, mode: ExpansionMode) => void;
  clearExpanded: () => void;
}
export declare const useExpansionStore: import("zustand").UseBoundStore<
  import("zustand").StoreApi<ExpansionState>
>;
export {};
//# sourceMappingURL=expansionStore.d.ts.map
