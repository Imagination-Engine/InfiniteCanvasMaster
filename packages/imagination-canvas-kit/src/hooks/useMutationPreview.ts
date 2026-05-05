// @ts-nocheck
import { useState, useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";

export interface MutationChange {
  id: string;
  updates: any;
}

export interface ProposedMutation {
  id: string;
  changes: MutationChange[];
}

export const useMutationPreview = () => {
  const [previewState, setPreviewState] = useState<ProposedMutation | null>(
    null,
  );

  const proposeMutation = useCallback((mutation: ProposedMutation) => {
    setPreviewState(mutation);
  }, []);

  const acceptMutation = useCallback(() => {
    if (!previewState) return;

    // Apply the changes to the main store
    previewState.changes.forEach((change) => {
      useCanvasStore.getState().updateObject(change.id, change.updates);
    });

    // Clear preview
    setPreviewState(null);
  }, [previewState]);

  const rejectMutation = useCallback(() => {
    setPreviewState(null);
  }, []);

  return {
    previewState,
    proposeMutation,
    acceptMutation,
    rejectMutation,
  };
};
