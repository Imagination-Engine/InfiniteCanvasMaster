import React from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import Canvas from "../../Canvas";
import { ChatShell } from "../../Chat/ChatShell";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import {
  Bot,
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  Grid,
} from "lucide-react";
import NodeLibraryModal from "../../../library/NodeLibraryPanel";

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
      {/* Canvas View - Always visible in the background in this new mode */}
      <div className="absolute inset-0 z-0">
        <Canvas />
      </div>

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
          // We can add a specialized "floating" prop to ChatShell if needed
        />
      </div>

      {/* Radiant Orb / Toolbar (tldraw Pattern) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4">
        {/* The Radiant Orb Toggle */}
        <button
          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group ${
            isChatCollapsed
              ? "bg-brand-purple shadow-[0_0_40px_rgba(123,92,234,0.6)] scale-110"
              : "bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
          }`}
        >
          {/* Radiant Pulsing Rings */}
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

          {/* Label Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              {isChatCollapsed ? "Summon Engine" : "Minimize Interface"}
            </span>
          </div>
        </button>

        {/* Floating tldraw-style Toolbar */}
        <div className="h-16 px-6 bg-brand-bg-surface/60 backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-2 border-r border-white/10 pr-6">
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="p-3 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple rounded-xl transition-all flex items-center gap-2 group/lib"
            >
              <Grid size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/lib:block transition-all">
                Library
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4 border-r border-white/10 pr-6">
            <button className="p-2 text-brand-text-muted hover:text-white transition-colors">
              <MousePointer2 size={20} />
            </button>
            <button className="p-2 text-brand-text-muted hover:text-white transition-colors">
              <Hand size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-brand-text-muted hover:text-white transition-colors">
              <Square size={20} />
            </button>
            <button className="p-2 text-brand-text-muted hover:text-white transition-colors">
              <Circle size={20} />
            </button>
            <button className="p-2 text-brand-text-muted hover:text-white transition-colors">
              <Type size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
