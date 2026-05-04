import React from "react";
import { CanvasObject } from "../../contracts";
import { FileText, ExternalLink } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";

export const ArtifactBlock: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const zoom = useViewportStore((s) => s.zoom);
  const title = (object.metadata?.title as string) || "Untitled Artifact";
  const content = (object.metadata?.content as string) || "";

  const isFarOut = zoom < 0.4;

  return (
    <div
      className="p-4 bg-brand-bg-surface border border-white/10 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl"
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
        <ExternalLink size={14} className="text-white/20" />
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
    </div>
  );
};
