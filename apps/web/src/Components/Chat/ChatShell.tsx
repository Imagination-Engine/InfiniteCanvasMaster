import React from "react";

interface ChatShellProps {
  projectId: string;
  initialMessages?: any[];
  fullScreen?: boolean;
}

export const ChatShell: React.FC<ChatShellProps> = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex flex-col bg-brand-bg-surface border border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl transition-all duration-500 ease-in-out ${fullScreen ? "w-full h-full" : "w-[450px] h-[80vh] rounded-3xl"}`}
    >
      {/* 
        This is the absolute masterstroke. 
        We iframe LibreChat directly into our Dual-View container.
        We get 100% of LibreChat's elite UX (multimodal, branching, editing, artifact rendering)
        while it talks to our Engine's MCP server under the hood.
      */}
      <iframe
        src="http://localhost:3080/"
        className="w-full h-full border-none"
        title="LibreChat Temporal Shell"
        allow="clipboard-read; clipboard-write; microphone; camera"
      />
    </div>
  );
};
