// @ts-nocheck
import { useState, useCallback, useRef, useEffect } from "react";

export type SyncStatus = "idle" | "saving" | "saved" | "error";

export const useAutosave = (debounceMs = 1000) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("saved");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(() => {
    setSyncStatus("saving");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Here we would typically sync with Yjs or backend
      // For now, it just simulates a successful save
      setSyncStatus("saved");
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    syncStatus,
    triggerAutosave,
  };
};
