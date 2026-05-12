// @ts-nocheck
import { useState, useCallback } from "react";
import { useOpenClawAdapter } from "../adapters/openclaw/OpenClawAdapterProvider";
import { useCanvasStore } from "../state/canvasStore";
/**
 * Hook providing controlled access to the task lifecycle via the adapter boundary.
 * Prevents UI from dealing directly with adapter promises and state fetching.
 */
export function useOpenClawTaskControl(blockId) {
  const adapter = useOpenClawAdapter();
  const getObject = useCanvasStore((s) => s.objects[blockId]);
  const [isStarting, setIsStarting] = useState(false);
  const [isError, setIsError] = useState(null);
  const getMetadata = useCallback(() => {
    // Re-evaluating fresh from store to ensure we have latest sessionId/policy
    // Rather than relying on a stale closure object
    if (!getObject) return null;
    return getObject.metadata;
  }, [getObject]);
  const start = useCallback(
    async (taskPrompt) => {
      setIsStarting(true);
      setIsError(null);
      try {
        const meta = getMetadata();
        if (!meta) throw new Error("Block not found");
        const sessionId = meta.runtime?.sessionId;
        if (!sessionId)
          throw new Error("No active session bound. Cannot start task.");
        const policy = meta.policy;
        await adapter.startTask(blockId, sessionId, taskPrompt, policy);
      } catch (err) {
        console.error("Failed to start OpenClaw task:", err);
        setIsError(err.message || "Failed to start task");
      } finally {
        setIsStarting(false);
      }
    },
    [adapter, blockId, getMetadata],
  );
  const pause = useCallback(async () => {
    try {
      const meta = getMetadata();
      const taskId = meta?.state?.currentTaskId;
      if (taskId) {
        await adapter.pauseTask(blockId, taskId);
      }
    } catch (err) {
      console.error("Failed to pause task:", err);
    }
  }, [adapter, blockId, getMetadata]);
  const resume = useCallback(async () => {
    try {
      const meta = getMetadata();
      const taskId = meta?.state?.currentTaskId;
      if (taskId) {
        await adapter.resumeTask(blockId, taskId);
      }
    } catch (err) {
      console.error("Failed to resume task:", err);
    }
  }, [adapter, blockId, getMetadata]);
  const stop = useCallback(async () => {
    try {
      const meta = getMetadata();
      const taskId = meta?.state?.currentTaskId;
      if (taskId) {
        await adapter.stopTask(blockId, taskId);
      }
    } catch (err) {
      console.error("Failed to stop task:", err);
    }
  }, [adapter, blockId, getMetadata]);
  return {
    start,
    pause,
    resume,
    stop,
    isStarting,
    isError,
  };
}
