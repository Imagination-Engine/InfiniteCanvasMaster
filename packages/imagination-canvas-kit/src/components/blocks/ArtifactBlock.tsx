// @ts-nocheck
import React, { useState } from "react";
import type { CanvasObject } from "../../contracts";
import { FileText, ExternalLink, Eye, X } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";

export const ArtifactBlock: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const zoom = useViewportStore((s) => s.zoom);
  const title = (object.metadata?.title as string) || "Untitled Artifact";
  const content = (object.metadata?.content as string) || "";

  const isFarOut = zoom < 0.4;

  const isPreviewable =
    content.includes("<!DOCTYPE html>") ||
    content.includes("<html") ||
    content.includes("import React") ||
    content.includes("export default") ||
    content.length > 100; // Allow previewing long text artifacts too

  return (
    <div
      className="p-4 bg-brand-bg-surface border border-white/10 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl relative group"
      style={{ width: object.width, height: object.height }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg text-brand-text-muted">
            <FileText size={16} />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest truncate">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewable && (
            <button
              onClick={() => setShowPreview(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity"
              title="Preview"
            >
              <Eye size={14} />
            </button>
          )}
          <ExternalLink size={14} className="text-white/20" />
        </div>
      </div>

      {!isFarOut ? (
        <div className="flex-1 text-[11px] text-brand-text-body leading-relaxed overflow-auto custom-scrollbar pr-1">
          {content}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-2 bg-white/5 rounded-full animate-pulse" />
        </div>
      )}

      <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
        <div className="text-[9px] text-brand-text-muted uppercase tracking-tighter">
          Artifact
        </div>
        <div className="text-[9px] text-brand-text-muted italic">
          {content.length} chars
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/80 backdrop-blur-sm p-10">
          <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden flex flex-col">
            <div className="h-12 bg-brand-bg-page border-b border-white/10 flex items-center justify-between px-6 shrink-0">
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                Preview: {title}
              </span>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={
                  content.includes("<html")
                    ? content
                    : `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body style="padding:20px; font-family:sans-serif;">${content}</body></html>`
                }
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
