import type { CanvasMode } from "../components/CanvasShell";
export type DensityMode =
  | "comfortable"
  | "compact"
  | "presentation"
  | "immersive";
interface ShellState {
  mode: CanvasMode;
  density: DensityMode;
  sessionContext: string | null;
  setMode: (mode: CanvasMode) => void;
  setDensity: (density: DensityMode) => void;
  setSessionContext: (context: string | null) => void;
}
export declare const useShellStore: import("zustand").UseBoundStore<
  import("zustand").StoreApi<ShellState>
>;
export {};
//# sourceMappingURL=shellStore.d.ts.map
