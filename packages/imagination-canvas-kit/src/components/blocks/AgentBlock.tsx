import React from "react";
import { CanvasObject } from "../../contracts";
import { Bot, UserCheck } from "lucide-react";

export const AgentBlock: React.FC<{ object: CanvasObject }> = ({ object }) => {
  const isWaiting = object.status === "waiting-for-user";

  return (
    <div
      className="p-4 bg-brand-bg-surface border border-brand-purple/30 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl"
      style={{ width: object.width, height: object.height }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-purple/20 rounded-lg text-brand-purple">
            <Bot size={16} />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest">
            {(object.metadata.agentName as string) || "Agent"}
          </div>
        </div>
        {isWaiting && (
          <div className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase rounded-full animate-pulse border border-amber-500/30">
            Checkpoint Required
          </div>
        )}
      </div>

      <div className="flex-1 text-[11px] text-brand-text-body leading-relaxed line-clamp-3 italic opacity-80">
        "{(object.metadata.lastAction as string) || "Idle."}"
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <div className="text-[10px] text-brand-text-muted">{object.status}</div>
        <button className="px-3 py-1 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple rounded-md text-[10px] font-bold transition-all uppercase tracking-tighter">
          Inspect
        </button>
      </div>
    </div>
  );
};
