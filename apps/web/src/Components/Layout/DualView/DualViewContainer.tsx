import React from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import { ChatShell } from "../../Chat/ChatShell";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { Bot, Grid } from "lucide-react";
import NodeLibraryModal from "../../../library/NodeLibraryPanel";
import { CanvasShell, InfiniteViewport } from "@iem/imagination-canvas-kit";

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

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* New Spatial Engine Canvas */}
      <CanvasShell>
        <InfiniteViewport />
      </CanvasShell>

      <NodeLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSave={saveCanvas}
      />

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

      {/* The Radiant Orb Toggle */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4">
        <button
          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group ${
            isChatCollapsed
              ? "bg-brand-purple shadow-[0_0_40px_rgba(123,92,234,0.6)] scale-110"
              : "bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
          }`}
        >
          {isChatCollapsed && (
            <>
              <div className="absolute inset-0 rounded-full bg-brand-purple animate-ping opacity-20" />
              <div className="absolute inset-[-4px] rounded-full border border-brand-purple/30 animate-pulse" />
            </>
          )}
          <Bot
            size={28}
            className={`transition-all duration-500 ${
              isChatCollapsed ? "text-white scale-110" : "text-brand-purple"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
