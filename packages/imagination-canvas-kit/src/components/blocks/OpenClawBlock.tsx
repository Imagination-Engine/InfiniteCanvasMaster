import React from "react";
import {
  Bot,
  Link,
  Cpu,
  ShieldAlert,
  Activity,
  Play,
  Pause,
  Square,
} from "lucide-react";
import { CanvasObject } from "../../contracts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useOpenClawTaskControl } from "../../hooks/useOpenClawTaskControl";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OpenClawBlock: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const data = (object.metadata as any) || {};
  const status = data.state?.status || "unconfigured";
  const connectionStatus = data.runtime?.connectionStatus || "unbound";
  const currentTask = data.state?.currentTask || "No active task";
  const progress = data.state?.progress || 0;

  const { pause, stop, resume } = useOpenClawTaskControl(object.id);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "running":
        return "text-brand-cyan";
      case "thinking":
        return "text-brand-purple animate-pulse";
      case "waiting_for_approval":
        return "text-amber-500";
      case "failed":
        return "text-red-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-white/40";
    }
  };

  const getConnectionIconColor = (s: string) => {
    switch (s) {
      case "connected":
        return "text-green-400";
      case "connecting":
        return "text-amber-400 animate-pulse";
      case "error":
        return "text-red-400";
      default:
        return "text-white/20";
    }
  };

  return (
    <div className="flex flex-col h-full text-white font-sans select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-cyan/10 rounded-xl text-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.1)]">
            <Bot size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-tighter leading-none">
              {data.title || "ImagiClaw Block"}
            </span>
            <span
              className={cn(
                "text-[8px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1",
                getStatusColor(status),
              )}
            >
              <Activity size={8} />
              {status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black uppercase opacity-30 tracking-widest">
              Runtime
            </span>
            <Link
              size={10}
              className={getConnectionIconColor(connectionStatus)}
            />
          </div>
          <div className="flex flex-col items-end border-l border-white/5 pl-3">
            <span className="text-[7px] font-black uppercase opacity-30 tracking-widest">
              Compute
            </span>
            <Cpu size={10} className="text-brand-purple/50" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3">
        {status === "unconfigured" ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-black/20 group hover:border-brand-cyan/20 transition-colors cursor-pointer">
            <Bot
              size={24}
              className="text-white/10 group-hover:text-brand-cyan/40 transition-colors mb-2"
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 group-hover:text-brand-cyan/60 transition-colors">
              Configure Runtime
            </span>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                  Active Task
                </span>
                {status === "waiting_for_approval" && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-500 text-[7px] font-black uppercase animate-pulse border border-amber-500/30">
                    <ShieldAlert size={8} />
                    Approval Needed
                  </div>
                )}
              </div>
              <p className="text-[11px] leading-relaxed font-medium text-white/80 line-clamp-2 italic">
                "{currentTask}"
              </p>

              {status === "running" && (
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-brand-cyan shadow-[0_0_10px_rgba(0,194,255,0.5)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Quick Stats / Capability Icons */}
            <div className="flex items-center gap-2 px-1">
              {data.capabilities?.canUseShell && (
                <div
                  className="p-1.5 bg-black/40 rounded-lg text-white/30"
                  title="Shell Access"
                >
                  <Activity size={12} />
                </div>
              )}
              {data.capabilities?.canUseFiles && (
                <div
                  className="p-1.5 bg-black/40 rounded-lg text-white/30"
                  title="Filesystem Access"
                >
                  <Activity size={12} />
                </div>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                {status === "paused" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resume();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all"
                    title="Resume"
                  >
                    <Play size={12} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pause();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 transition-all"
                    title="Pause"
                  >
                    <Pause size={12} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    stop();
                  }}
                  className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-white/20 transition-all"
                  title="Stop"
                >
                  <Square size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer / Meta */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
            Live Event Stream
          </span>
        </div>
        <button className="px-3 py-1 bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all">
          Inspect
        </button>
      </div>
    </div>
  );
};
