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
  sanitizeCanvasData,
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

  useEffect(() => {
    console.log(
      "[DualView] projectId changed. Resetting canvas states and clearing stores.",
      { projectId },
    );
    hasInitialized.current = false;
    documentSyncedRef.current = null;
    if (saveTimerRef.current) {
      console.log("[DualView] Clearing save timer due to project switch.");
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    useCanvasStore.setState({ objects: {}, connections: [], bindings: [] });
    useConnectionStore.setState({ connections: {} });
  }, [projectId]);

  const persistSpatialToServer = useCallback(() => {
    if (!saveCanvas) return;
    if (!hasInitialized.current) {
      console.warn(
        "[DualView] persistSpatialToServer called, but hasInitialized is false. Ignoring auto-save.",
      );
      return;
    }
    const objects = useCanvasStore.getState().objects;
    const connections = useConnectionStore.getState().connections;
    const bindings = useCanvasStore.getState().bindings || [];

    console.log("[DualView] persistSpatialToServer: starting save...", {
      objectsCount: Object.keys(objects).length,
      connectionsCount: Object.keys(connections).length,
      bindingsCount: bindings.length,
    });

    // Sanitize before exporting to server to ensure 100% compliant UUID formats
    const sanitized = sanitizeCanvasData(objects, connections, bindings);
    if (sanitized.changed) {
      console.log(
        "[DualView] Sanitized non-UUID IDs in stores before save:",
        sanitized.idMap,
      );
      useCanvasStore.setState({
        objects: sanitized.objects,
        bindings: sanitized.bindings,
      });
      useConnectionStore.setState({
        connections: sanitized.connections,
      });
    }

    const viewport = useViewportStore.getState();
    const doc = exportCanvasToDocument(
      sanitized.objects,
      sanitized.connections,
      {
        x: viewport.x,
        y: viewport.y,
        zoom: viewport.zoom,
      },
    ) as UnifiedCanvasDocument;

    console.log(
      "[DualView] Calling saveCanvas with document:",
      JSON.stringify(doc),
    );

    void saveCanvas(doc)
      .then(() => {
        console.log("[DualView] saveCanvas request succeeded.");
      })
      .catch((err) =>
        console.warn("[DualView] Failed to persist spatial canvas:", err),
      );
  }, [saveCanvas]);

  const schedulePersist = useCallback(() => {
    console.log(
      "[DualView] schedulePersist triggered. Setting 800ms debounce timer.",
    );
    if (saveTimerRef.current) {
      console.log("[DualView] Clearing existing save timer.");
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      console.log(
        "[DualView] Save timer fired. Invoking persistSpatialToServer.",
      );
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

    const serverConnections = documentEdgesToConnections(doc);
    const localConnections = useConnectionStore.getState().connections;
    const allConnections = { ...localConnections, ...serverConnections };

    const bindings = useCanvasStore.getState().bindings || [];

    // Sanitize after merging server data to protect UI state references
    const sanitized = sanitizeCanvasData(merged, allConnections, bindings);

    useCanvasStore.setState({
      objects: sanitized.objects,
      bindings: sanitized.bindings,
    });
    useConnectionStore.setState({
      connections: sanitized.connections,
    });
  }, []);

  // --- Spatial Sync: merge server document after localStorage hydration ---
  useEffect(() => {
    if (!initialDocument) {
      console.log(
        "[DualView] initialDocument is null/undefined. Skipping sync.",
      );
      return;
    }

    const docKey = `${projectId}:${initialDocument.nodes?.length ?? 0}:${initialDocument.edges?.length ?? 0}`;
    console.log("[DualView] Spatial Sync useEffect triggered.", {
      docKey,
      docSynced: documentSyncedRef.current,
    });
    if (documentSyncedRef.current === docKey) return;

    const runMerge = () => {
      console.log(
        "[DualView] runMerge executing. Merging server doc into store.",
        {
          serverNodesCount: initialDocument.nodes?.length ?? 0,
          localObjectsCount: Object.keys(useCanvasStore.getState().objects)
            .length,
        },
      );
      applyDocumentToStores(initialDocument);
      documentSyncedRef.current = docKey;
      // Mark as initialized to enable future autosaves
      console.log("[DualView] Setting timer to flip hasInitialized to true.");
      setTimeout(() => {
        hasInitialized.current = true;
        console.log(
          "[DualView] hasInitialized flipped to true. Autosave is now active.",
        );
      }, 200);
    };

    if (useCanvasStore.persist.hasHydrated()) {
      console.log(
        "[DualView] Canvas store already hydrated. Running merge immediately.",
      );
      runMerge();
      return;
    }

    console.log(
      "[DualView] Canvas store not hydrated yet. Subscribing to onFinishHydration.",
    );
    const unsub = useCanvasStore.persist.onFinishHydration(() => {
      console.log(
        "[DualView] onFinishHydration callback fired. Running merge.",
      );
      runMerge();
    });
    return unsub;
  }, [initialDocument, projectId, applyDocumentToStores]);

  // Persist generated changes, additions, deletions, or connections to server
  useEffect(() => {
    if (!saveCanvas) return;

    console.log(
      "[DualView] Registering canvas and connection store subscribers.",
    );
    let prevObjects = useCanvasStore.getState().objects;
    const unsubscribeCanvas = useCanvasStore.subscribe((state) => {
      if (state.objects === prevObjects) return;
      console.log("[DualView] Canvas objects reference changed.", {
        prevCount: Object.keys(prevObjects).length,
        nextCount: Object.keys(state.objects).length,
        hasInitialized: hasInitialized.current,
      });
      prevObjects = state.objects;
      schedulePersist();
    });

    let prevConnections = useConnectionStore.getState().connections;
    const unsubscribeConnection = useConnectionStore.subscribe((state) => {
      if (state.connections === prevConnections) return;
      console.log("[DualView] Canvas connections reference changed.", {
        prevCount: Object.keys(prevConnections).length,
        nextCount: Object.keys(state.connections).length,
        hasInitialized: hasInitialized.current,
      });
      prevConnections = state.connections;
      schedulePersist();
    });

    return () => {
      console.log(
        "[DualView] Cleaning up canvas and connection store subscribers.",
      );
      unsubscribeCanvas();
      unsubscribeConnection();
      if (saveTimerRef.current) {
        console.log("[DualView] Clearing save timer during cleanup.");
        clearTimeout(saveTimerRef.current);
      }
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
