/**
 * Hook providing controlled access to the task lifecycle via the adapter boundary.
 * Prevents UI from dealing directly with adapter promises and state fetching.
 */
export declare function useOpenClawTaskControl(blockId: string): {
  start: (taskPrompt: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  isStarting: boolean;
  isError: string | null;
};
//# sourceMappingURL=useOpenClawTaskControl.d.ts.map
