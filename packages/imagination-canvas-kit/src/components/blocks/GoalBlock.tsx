import React from "react";
import { CanvasObject } from "../../contracts";
import { Target, CheckCircle2, Clock } from "lucide-react";

export const GoalBlock: React.FC<{ object: CanvasObject }> = ({ object }) => {
  const progress = (object.metadata?.progress as number) || 0;
  const title = (object.metadata?.title as string) || "Untitled Goal";

  const isComplete = object.status === "complete";
  const isRunning = object.status === "running";

  return (
    <div
      className="p-4 bg-brand-bg-surface border border-brand-cyan/30 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl"
      style={{ width: object.width, height: object.height }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-cyan/20 rounded-lg text-brand-cyan">
            <Target size={16} />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest truncate max-w-[150px]">
            {title}
          </div>
        </div>
        {isComplete ? (
          <CheckCircle2 size={14} className="text-green-400" />
        ) : isRunning ? (
          <Clock size={14} className="text-brand-cyan animate-pulse" />
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex justify-between text-[10px] text-brand-text-muted font-bold uppercase tracking-tighter">
          <span>Progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-cyan transition-all duration-500 shadow-[0_0_8px_rgba(0,194,255,0.4)]"
            style={{ width: (progress * 100).toString() + "%" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <div className="text-[10px] text-brand-text-muted uppercase tracking-widest">
          {object.status}
        </div>
        <button className="px-3 py-1 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded-md text-[10px] font-bold transition-all uppercase tracking-tighter">
          Details
        </button>
      </div>
    </div>
  );
};
