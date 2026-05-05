// @ts-nocheck
import React from "react";
import type { OpenClawAgentGroup } from "../../contracts/openclaw";
import type { CanvasObject } from "../../contracts";
import { Users, Target, Play, Pause, Square, Activity } from "lucide-react";
import { useOpenClawGroupControl } from "../../hooks/useOpenClawGroupControl";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OpenClawAgentGroupBlock: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  //
  const data = (object.metadata as any) || {};
  // removed double decl
  const status = data.state?.status || "idle";
  const memberCount = data.memberBlockIds?.length || 0;

  const { startGroupTask, pauseGroup, stopGroup, isOrchestrating } =
    useOpenClawGroupControl(object.id);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "running":
        return "text-brand-cyan";
      case "planning":
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

  return (
    <div className="flex flex-col h-full text-white font-sans select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-purple/10 rounded-xl text-brand-purple shadow-[0_0_15px_rgba(180,0,255,0.1)]">
            <Users size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-tighter leading-none">
              {data.title || "Agent Task Force"}
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
              Members
            </span>
            <span className="text-[10px] font-mono font-bold text-white/80">
              {memberCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/40">
            <Target size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Group Objective
            </span>
          </div>
          <p className="text-[11px] leading-relaxed font-medium text-white/80 line-clamp-3 italic">
            {data.task?.userIntent ||
              "No objective set. Select blocks and define a goal to begin orchestration."}
          </p>
        </div>

        {/* Quick Subtask Stats */}
        {data.task && data.task.subtasks && data.task.subtasks.length > 0 && (
          <div className="flex items-center gap-2 px-1 text-[9px] uppercase tracking-widest font-bold">
            <span className="text-brand-cyan">
              {
                data.task.subtasks.filter((s) => s.status === "completed")
                  .length
              }{" "}
              Done
            </span>
            <span className="text-white/20">•</span>
            <span className="text-amber-500">
              {
                data.task.subtasks.filter(
                  (s) => s.status === "running" || s.status === "assigned",
                ).length
              }{" "}
              Active
            </span>
            <span className="text-white/20">•</span>
            <span className="text-white/40">
              {
                data.task.subtasks.filter((s) => s.status === "unassigned")
                  .length
              }{" "}
              Pending
            </span>
          </div>
        )}

        {/* Global Controls */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {status === "idle" ||
          status === "completed" ||
          status === "stopped" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGroupTask(data.task?.userIntent || "Execute objective");
              }}
              disabled={isOrchestrating || memberCount === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 text-brand-purple rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50"
            >
              <Play size={12} /> Orchestrate
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  pauseGroup();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                <Pause size={12} /> Pause All
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopGroup();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                <Square size={12} /> Stop All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
