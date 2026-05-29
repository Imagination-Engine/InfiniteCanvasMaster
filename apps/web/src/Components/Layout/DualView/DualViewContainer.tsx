// @ts-nocheck
import React, { useEffect, useRef, useCallback } from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { ChatShell } from "../../Chat/ChatShell";
import { useAuth } from "../../../auth/AuthContext";

import {
  CanvasShell,
  InfiniteViewport,
  useCanvasStore,
  useConnectionStore,
  mergeDocumentIntoCanvasObjects,
  documentEdgesToConnections,
  exportCanvasToDocument,
  useViewportStore,
} from "@iem/imagination-canvas-kit";

interface DualViewContainerProps {
  projectId: string;
  initialDocument: UnifiedCanvasDocument | null;
  initialMessages: any[];
  projectName: string;
  saveCanvas: (doc: UnifiedCanvasDocument) => Promise<void>;
}

export const DualViewContainer: React.FC<DualViewContainerProps> = ({
  projectId,
  initialDocument,
  initialMessages,
  saveCanvas,
}) => {
  const { accessToken } = useAuth();
  const hasInitialized = React.useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const documentSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      useCanvasStore.getState().setAccessToken(accessToken);
    }
  }, [accessToken]);

  const persistSpatialToServer = useCallback(() => {
    if (!saveCanvas || !hasInitialized.current) return;
    const objects = useCanvasStore.getState().objects;
    const connections = useConnectionStore.getState().connections;
    const viewport = useViewportStore.getState();
    const doc = exportCanvasToDocument(objects, connections, {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    }) as UnifiedCanvasDocument;
    void saveCanvas(doc).catch((err) =>
      console.warn("[DualView] Failed to persist spatial canvas:", err),
    );
  }, [saveCanvas]);

  const schedulePersist = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistSpatialToServer();
    }, 800);
  }, [persistSpatialToServer]);

  // --- Create Session Context Summary ---
  const sessionSummary = React.useMemo(() => {
    const userMessages = (initialMessages || [])
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .slice(0, 3)
      .join(" | ");
    return userMessages || "New Creative Session";
  }, [initialMessages]);

  const applyDocumentToStores = useCallback((doc: UnifiedCanvasDocument) => {
    const currentObjects = useCanvasStore.getState().objects;
    const merged = mergeDocumentIntoCanvasObjects(currentObjects, doc);
    useCanvasStore.setState({ objects: merged });

    const serverConnections = documentEdgesToConnections(doc);
    const localConnections = useConnectionStore.getState().connections;
    useConnectionStore.setState({
      connections: { ...localConnections, ...serverConnections },
    });
  }, []);

  // --- Spatial Sync: merge server document after localStorage hydration ---
  useEffect(() => {
    if (!initialDocument) return;

    const docKey = `${projectId}:${initialDocument.nodes?.length ?? 0}:${initialDocument.edges?.length ?? 0}`;
    if (documentSyncedRef.current === docKey) return;

    const runMerge = () => {
      applyDocumentToStores(initialDocument);
      documentSyncedRef.current = docKey;
      // Mark as initialized to enable future autosaves
      setTimeout(() => {
        hasInitialized.current = true;
      }, 200);
    };

    if (useCanvasStore.persist.hasHydrated()) {
      runMerge();
      return;
    }

    const unsub = useCanvasStore.persist.onFinishHydration(() => {
      runMerge();
    });
    return unsub;
  }, [initialDocument, projectId, applyDocumentToStores]);

  // Persist generated changes, additions, deletions, or connections to server
  useEffect(() => {
    if (!saveCanvas) return;

    const unsubscribeCanvas = useCanvasStore.subscribe((state, prev) => {
      if (state.objects === prev.objects) return;
      schedulePersist();
    });

    const unsubscribeConnection = useConnectionStore.subscribe(
      (state, prev) => {
        if (state.connections === prev.connections) return;
        schedulePersist();
      },
    );

    return () => {
      unsubscribeCanvas();
      unsubscribeConnection();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [saveCanvas, schedulePersist]);

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* New Spatial Engine Canvas - The sole source of truth */}
      <CanvasShell
        canvasId={projectId}
        sessionContext={sessionSummary}
        ChatComponent={ChatShell as any}
      >
        <InfiniteViewport />
      </CanvasShell>
    </div>
  );
};
