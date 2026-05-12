import { type Rect, type BoundingBoxed } from "../utils/math";
export type SelectionMode =
  | "none"
  | "single"
  | "multi"
  | "group"
  | "region"
  | "semantic";
interface SelectionOptions {
  additive?: boolean;
  toggle?: boolean;
}
interface SelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  selectionMode: SelectionMode;
  editingId: string | null;
  select: (id: string, options?: SelectionOptions) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setEditing: (id: string | null) => void;
  selectInRect: (rect: Rect, objects: BoundingBoxed[]) => void;
}
export declare const useSelectionStore: import("zustand").UseBoundStore<
  import("zustand").StoreApi<SelectionState>
>;
export {};
//# sourceMappingURL=selectionStore.d.ts.map
