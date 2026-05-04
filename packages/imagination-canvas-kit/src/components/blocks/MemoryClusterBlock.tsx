import React from "react";
import { CanvasObject } from "../../contracts";
import { Brain, Layers } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";

export const MemoryClusterBlock: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const zoom = useViewportStore((s) => s.zoom);
  const summary =
    (object.metadata?.summary as string) || "Empty Memory Cluster";
  const itemsCount = (object.metadata?.itemsCount as number) || 0;

  const isFarOut = zoom < 0.4;

  return (
    <div
      className="p-4 bg-brand-bg-surface border border-brand-purple/20 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl overflow-hidden"
      style={{ width: object.width, height: object.height }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-brand-purple/20 rounded-lg text-brand-purple">
          <Brain size={16} />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest">
          Memory Cluster
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center">
        {!isFarOut ? (
          <>
            <div className="text-[12px] font-medium leading-relaxed text-brand-text-body px-2">
              {summary}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full">
              <Layers size={10} className="text-brand-purple" />
              <span className="text-[10px] font-black uppercase text-brand-purple tracking-widest">
                {itemsCount} Items
              </span>
            </div>
          </>
        ) : (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-purple/20 rounded-full animate-ping opacity-20" />
            <Brain size={24} className="text-brand-purple opacity-40" />
          </div>
        )}
      </div>

      <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
        <div className="text-[9px] text-brand-text-muted uppercase tracking-tighter">
          Knowledge Base
        </div>
        <div className="text-[9px] text-brand-text-muted">v1.0</div>
      </div>
    </div>
  );
};
