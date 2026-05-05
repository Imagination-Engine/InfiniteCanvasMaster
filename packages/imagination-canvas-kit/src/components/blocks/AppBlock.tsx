// @ts-nocheck
import React, { useState } from "react";
import type { CanvasObject } from "../../contracts";
import { AppWindow, RefreshCw, ShieldAlert } from "lucide-react";

export const AppBlock: React.FC<{ object: CanvasObject }> = ({ object }) => {
  const [key, setKey] = useState(0);
  const appUrl = (object.metadata?.appUrl as string) || "";
  const title = (object.metadata?.title as string) || "External App";

  const isLoading = object.status === "idle" || object.status === "thinking";
  const isError = object.status === "error";

  const handleRefresh = () => setKey((prev) => prev + 1);

  return (
    <div className="w-full h-full bg-brand-bg-surface border border-white/10 rounded-2xl shadow-2xl text-white flex flex-col overflow-hidden backdrop-blur-xl">
      {/* App Header */}
      <div className="h-8 bg-black/20 border-b border-white/5 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <AppWindow size={14} className="text-brand-cyan" />
          <span className="text-[10px] font-bold uppercase tracking-widest truncate">
            {title}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* App Runtime */}
      <div className="flex-1 relative bg-white/[0.02]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-brand-bg-surface/80 backdrop-blur-md">
            <div className="w-8 h-8 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan animate-pulse">
              Initializing Runtime...
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-red-950/20 backdrop-blur-md">
            <ShieldAlert size={32} className="text-red-500" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
              Runtime Error
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-500 uppercase tracking-widest"
            >
              Restart
            </button>
          </div>
        )}

        {appUrl ? (
          <iframe
            key={key}
            src={appUrl}
            title={title}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[10px] text-brand-text-muted italic">
            No URL provided for app runtime.
          </div>
        )}
      </div>
    </div>
  );
};
