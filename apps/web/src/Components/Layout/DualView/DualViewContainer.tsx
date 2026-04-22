import React from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import Canvas from "../../Canvas";
import { ChatShell } from "../../Chat/ChatShell";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";

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

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* Canvas View */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${isCanvasVisible ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
      >
        <Canvas initialDocument={initialDocument} onDocumentChange={saveCanvas} />
      </div>

      {/* Chat View */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${!isCanvasVisible ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
      >
        {/* We reuse ChatShell but need to make sure it can be "full screen" or "dual view" */}
        <ChatShell 
          projectId={projectId} 
          initialMessages={initialMessages} 
          fullScreen={!isCanvasVisible}
        />
      </div>

      {/* Floating Toggle Button (as specified in MASTER-00 Section 8) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={toggleCanvas}
          className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-full font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 border border-white/20 backdrop-blur-xl"
        >
          {isCanvasVisible ? "Switch to Chat" : "Switch to Canvas"}
        </button>
      </div>
    </div>
  );
};
