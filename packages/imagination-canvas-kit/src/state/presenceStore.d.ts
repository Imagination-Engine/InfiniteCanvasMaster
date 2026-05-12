export interface CanvasPresence {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  lastActive: number;
  isAgent?: boolean;
  selectionIds?: string[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}
interface PresenceState {
  users: Record<string, CanvasPresence>;
  updateUser: (id: string, patch: Partial<CanvasPresence>) => void;
  removeUser: (id: string) => void;
}
export declare const usePresenceStore: import("zustand").UseBoundStore<
  import("zustand").StoreApi<PresenceState>
>;
export {};
//# sourceMappingURL=presenceStore.d.ts.map
