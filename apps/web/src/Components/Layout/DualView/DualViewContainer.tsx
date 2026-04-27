import React, { useEffect } from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import { ChatShell } from "../../Chat/ChatShell";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { Bot, LayoutGrid, X } from "lucide-react";
import NodeLibraryDrawer from "../../../library/NodeLibraryDrawer";
import { ImmersiveBlockModal } from "./ImmersiveBlockModal";
import { viewRegistry } from "../../../block/ViewRegistry";
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
  projectName,
  saveCanvas,
}) => {
  const { isCanvasVisible, toggleCanvas } = useSessionStore();
  const [isChatFloating, setIsChatFloating] = React.useState(true);
  const [isChatCollapsed, setIsChatCollapsed] = React.useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);

  // Convert the application's viewRegistry class into the plain record required by canvas-kit
  const registryRecord = React.useMemo(() => {
    const record: Record<string, React.FC<any>> = {};
    viewRegistry.list().forEach((blockId) => {
      const ViewComponent = viewRegistry.get(blockId);
      if (ViewComponent) {
        record[blockId] = ViewComponent;
      }
    });
    return record;
  }, []);

  // --- Spatial Sync: Initialize Stores from Document ---
  useEffect(() => {
    if (!initialDocument) return;

    const objects: Record<string, any> = {};
    (initialDocument.nodes || []).forEach((node) => {
      objects[node.id] = {
        id: node.id,
        type: node.type || "note",
        x: node.position?.x || node.x || 0,
        y: node.position?.y || node.y || 0,
        width: node.width || 300,
        height: node.height || 200,
        zIndex: 1,
        status: "idle",
        metadata: {
          label: node.data?.label,
          description: node.data?.description,
          ...node.data,
        },
      };
    });
    useCanvasStore.setState({ objects });

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
      {/* New Spatial Engine Canvas */}
      <CanvasShell registry={registryRecord}>
        <InfiniteViewport />
      </CanvasShell>

      <NodeLibraryDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <ImmersiveBlockModal />

      {/* Floating Agent Chat (LibreChat Pattern) */}
      <div
        className={`absolute top-6 right-6 z-50 transition-all duration-500 ease-in-out ${
          isChatCollapsed
            ? "translate-x-[120%] opacity-0 pointer-events-none"
            : "translate-x-0 opacity-100"
        }`}
      >
        <ChatShell
          projectId={projectId}
          initialMessages={initialMessages}
          fullScreen={false}
        />
      </div>

      {/* The Radiant Orb Toggle (REDUCED SIZE) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4">
        <button
          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 group ${
            isChatCollapsed
              ? "bg-brand-purple shadow-[0_0_30px_rgba(123,92,234,0.5)] scale-110"
              : "bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
          }`}
        >
          {isChatCollapsed && (
            <>
              <div className="absolute inset-0 rounded-full bg-brand-purple animate-ping opacity-20" />
              <div className="absolute inset-[-3px] rounded-full border border-brand-purple/30 animate-pulse" />
            </>
          )}
          {isChatCollapsed ? (
            <Bot size={20} className="text-white" />
          ) : (
            <X size={20} className="text-white/60 group-hover:text-white" />
          )}
        </button>

        {/* Library Trigger */}
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/60 hover:text-brand-cyan hover:bg-white/20 transition-all shadow-xl"
        >
          <LayoutGrid size={20} />
        </button>
      </div>
    </div>
  );
};
