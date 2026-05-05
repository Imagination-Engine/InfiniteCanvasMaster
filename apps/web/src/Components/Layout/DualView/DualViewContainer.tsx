import React, { useEffect } from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { ChatShell } from "../../Chat/ChatShell";

import {
  CanvasShell,
  InfiniteViewport,
  useCanvasStore,
  useConnectionStore,
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
}) => {
  // --- Create Session Context Summary ---
  const sessionSummary = React.useMemo(() => {
    const userMessages = (initialMessages || [])
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .slice(0, 3)
      .join(" | ");
    return userMessages || "New Creative Session";
  }, [initialMessages]);

  // --- Spatial Sync: Initialize Stores from Document ---
  useEffect(() => {
    if (!initialDocument) return;

    const objects: Record<string, any> = {};
    (initialDocument.nodes || []).forEach((node) => {
      objects[node.id] = {
        id: node.id,
        type: node.type || "note",
        x: node.position?.x || (node as any).x || 0,
        y: node.position?.y || (node as any).y || 0,
        width: node.width || 320,
        height: node.height || 240,
        zIndex: 1,
        status: "idle",
        metadata: {
          label: node.data?.label,
          description: node.data?.description,
          ...node.data,
        },
      };
    });
    useCanvasStore.setState({ objects: objects as any });

    const connections: Record<string, any> = {};
    (initialDocument.edges || []).forEach((edge) => {
      connections[edge.id] = {
        id: edge.id,
        fromId: edge.source,
        toId: edge.target,
        label: edge.label || edge.data?.label,
      };
    });
    useConnectionStore.setState({ connections });
  }, [initialDocument]);

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
