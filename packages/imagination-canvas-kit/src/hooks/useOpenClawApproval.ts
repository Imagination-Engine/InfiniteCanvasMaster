// @ts-nocheck
import { useState, useCallback, useMemo } from "react";
import { useOpenClawAdapter } from "../adapters/openclaw/OpenClawAdapterProvider";
import { useCanvasStore } from "../state/canvasStore";
import { OpenClawBlock, OpenClawApprovalRequest } from "../contracts/openclaw";

/**
 * Hook providing controlled access to the approval queue for a specific block.
 */
export function useOpenClawApproval(blockId: string) {
  const adapter = useOpenClawAdapter();
  const getObject = useCanvasStore((s) => s.objects[blockId]);
  const updateObject = useCanvasStore((s) => s.updateObject);

  const [isProcessing, setIsProcessing] = useState(false);

  const queue = useMemo(() => {
    if (!getObject) return [];
    const meta = getObject.metadata as unknown as OpenClawBlock;
    return meta.state?.approvalQueue || [];
  }, [getObject]);

  const removeLocalRequest = (requestId: string) => {
    if (!getObject) return;
    const meta = getObject.metadata as unknown as OpenClawBlock;
    const currentQueue = meta.state?.approvalQueue || [];

    // Optimistically clear the queue item in local state
    const nextQueue = currentQueue.filter((r) => r.requestId !== requestId);
    const nextStatus =
      nextQueue.length === 0 ? "running" : "waiting_for_approval";

    updateObject(blockId, {
      metadata: {
        ...meta,
        state: {
          ...meta.state,
          status: nextStatus,
          approvalQueue: nextQueue,
        },
      } as any,
    });
  };

  const approve = useCallback(
    async (requestId: string) => {
      setIsProcessing(true);
      try {
        await adapter.approveAction(blockId, requestId);
        removeLocalRequest(requestId);
      } catch (err) {
        console.error(`Failed to approve request ${requestId}:`, err);
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter, blockId, getObject],
  );

  const deny = useCallback(
    async (requestId: string) => {
      setIsProcessing(true);
      try {
        await adapter.denyAction(blockId, requestId);
        removeLocalRequest(requestId);
      } catch (err) {
        console.error(`Failed to deny request ${requestId}:`, err);
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter, blockId, getObject],
  );

  return {
    queue,
    approve,
    deny,
    isProcessing,
  };
}
