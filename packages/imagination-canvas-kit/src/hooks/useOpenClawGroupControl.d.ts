/**
 * TDD: Hook to control a group of OpenClaw Blocks,
 * coordinate subtasks, and update group state.
 */
export declare function useOpenClawGroupControl(groupId: string): {
  startGroupTask: (userIntent: string) => Promise<void>;
  assignSubtask: (subtaskId: string, blockId: string) => Promise<void>;
  pauseGroup: () => Promise<void>;
  stopGroup: () => Promise<void>;
  isOrchestrating: boolean;
};
//# sourceMappingURL=useOpenClawGroupControl.d.ts.map
