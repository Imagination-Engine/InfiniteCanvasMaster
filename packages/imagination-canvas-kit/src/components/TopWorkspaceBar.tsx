import React from "react";

export interface TopWorkspaceBarProps {
  workspaceName?: string;
  canvasTitle?: string;
  syncStatus?: "synced" | "syncing" | "offline" | "error";
  className?: string;
}

export const TopWorkspaceBar: React.FC<TopWorkspaceBarProps> = ({
  workspaceName = "Workspace",
  canvasTitle = "Untitled Canvas",
  syncStatus = "synced",
  className,
}) => {
  return (
    <div
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-4 py-2 rounded-full bg-brand-bg-card/80 backdrop-blur-md border border-white/10 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-2 border-r border-white/10 pr-4">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">
          {workspaceName}
        </span>
        <span className="text-sm font-medium text-white">{canvasTitle}</span>
      </div>
      <div className="flex items-center gap-2 pl-2">
        <div
          className={`w-2 h-2 rounded-full ${
            syncStatus === "synced"
              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              : syncStatus === "syncing"
                ? "bg-blue-500 animate-pulse"
                : "bg-red-500"
          }`}
        />
        <span className="text-[10px] uppercase font-mono text-white/60">
          {syncStatus}
        </span>
      </div>
    </div>
  );
};
