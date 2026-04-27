import { useState, useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { OpenClawAgentGroup, OpenClawSubtask } from "../contracts/openclaw";

/**
 * TDD: Hook to control a group of OpenClaw Blocks,
 * coordinate subtasks, and update group state.
 */
export function useOpenClawGroupControl(groupId: string) {
  const getObject = useCanvasStore((s) => s.objects[groupId]);
  const updateObject = useCanvasStore((s) => s.updateObject);

  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const getMetadata = useCallback((): OpenClawAgentGroup | null => {
    if (!getObject) return null;
    return getObject.metadata as unknown as OpenClawAgentGroup;
  }, [getObject]);

  const startGroupTask = useCallback(
    async (userIntent: string) => {
      setIsOrchestrating(true);
      try {
        const meta = getMetadata();
        if (!meta) throw new Error("Group not found");

        // In reality, this would invoke Mastra supervisor to plan and assign subtasks.
        // For now, we optimisticly set the status to planning.
        updateObject(groupId, {
          metadata: {
            ...meta,
            state: {
              ...meta.state,
              status: "planning",
            },
            task: {
              taskId: `group-task-${Date.now()}`,
              userIntent,
              subtasks: [],
              expectedOutputs: [],
              createdAt: new Date().toISOString(),
            },
          } as any,
        });
      } catch (err) {
        console.error("Failed to start group task:", err);
      } finally {
        setIsOrchestrating(false);
      }
    },
    [groupId, getMetadata, updateObject],
  );

  const assignSubtask = useCallback(
    async (subtaskId: string, blockId: string) => {
      const meta = getMetadata();
      if (!meta || !meta.task) return;

      const subtasks = meta.task.subtasks.map((st) =>
        st.subtaskId === subtaskId
          ? { ...st, status: "assigned" as const, assignedBlockId: blockId }
          : st,
      );

      updateObject(groupId, {
        metadata: {
          ...meta,
          task: {
            ...meta.task,
            subtasks,
          },
        } as any,
      });
    },
    [groupId, getMetadata, updateObject],
  );

  const pauseGroup = useCallback(async () => {
    const meta = getMetadata();
    if (!meta) return;

    // Ideally, loops through `memberBlockIds` and pauses each task via adapter.
    // For local state:
    updateObject(groupId, {
      metadata: {
        ...meta,
        state: { ...meta.state, status: "paused" },
      } as any,
    });
  }, [groupId, getMetadata, updateObject]);

  const stopGroup = useCallback(async () => {
    const meta = getMetadata();
    if (!meta) return;

    // Ideally, loops through `memberBlockIds` and stops each task via adapter.
    updateObject(groupId, {
      metadata: {
        ...meta,
        state: { ...meta.state, status: "stopped" },
      } as any,
    });
  }, [groupId, getMetadata, updateObject]);

  return {
    startGroupTask,
    assignSubtask,
    pauseGroup,
    stopGroup,
    isOrchestrating,
  };
}
