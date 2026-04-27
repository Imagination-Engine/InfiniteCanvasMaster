import React, { useState } from "react";
import {
  Shield,
  Terminal,
  Cpu,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Square,
  List,
  ShieldAlert,
} from "lucide-react";
import {
  CanvasObject,
  OpenClawBlock as OpenClawBlockType,
} from "../../contracts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useOpenClawEventStream } from "../../hooks/useOpenClawEventStream";
import { useOpenClawTaskControl } from "../../hooks/useOpenClawTaskControl";
import { useModelRouting } from "../../hooks/useModelRouting";
import { OpenClawTaskTimeline } from "./OpenClawTaskTimeline";
import { OpenClawApprovalQueue } from "./OpenClawApprovalQueue";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OpenClawBlockInspector: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const data = (object.metadata as unknown as OpenClawBlockType) || {};
  const status = data.state?.status || "unconfigured";
  const currentTask = data.state?.currentTask;

  const { events } = useOpenClawEventStream(object.id);
  const { start, pause, resume, stop, isStarting, isError } =
    useOpenClawTaskControl(object.id);

  // Use the routing heuristic engine based on active task
  const { decision } = useModelRouting(undefined, currentTask);

  const [taskInput, setTaskInput] = useState("");

  return (
    <div className="space-y-8 pb-10">
      {/* Runtime Status & Connection */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-brand-cyan">
          <Activity size={14} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">
            Runtime & Session
          </h3>
        </div>

        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
              Status
            </span>
            <span
              className={cn(
                "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                status === "running"
                  ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20"
                  : "bg-white/5 text-white/40 border-white/10",
              )}
            >
              {status.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
              Environment
            </span>
            <span className="text-[10px] text-white font-mono opacity-80">
              {data.runtime?.environment || "unknown"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
              Connection
            </span>
            <span className="text-[10px] text-white font-mono opacity-80">
              {data.runtime?.connectionStatus || "unbound"}
            </span>
          </div>
        </div>

        {/* Task Control Actions */}
        <div className="space-y-2">
          {isError && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] rounded-lg">
              {isError}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter new task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-brand-cyan transition-colors"
            />
            <button
              onClick={() => {
                start(taskInput || "Analyze current workspace");
                setTaskInput("");
              }}
              disabled={isStarting}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50"
            >
              <Play size={12} /> {isStarting ? "..." : "Start"}
            </button>
          </div>

          <div className="flex gap-2">
            {status === "paused" ? (
              <button
                onClick={resume}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                <Play size={12} /> Resume
              </button>
            ) : (
              <button
                onClick={pause}
                disabled={status !== "running" && status !== "using_tool"}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-30"
              >
                <Pause size={12} /> Pause
              </button>
            )}

            <button
              onClick={stop}
              disabled={status === "unconfigured" || status === "offline"}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-30"
            >
              <Square size={12} /> Stop
            </button>
          </div>
        </div>
      </section>

      {/* Security & Policy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-amber-500">
          <Shield size={14} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">
            Security & Policy
          </h3>
        </div>

        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
              Sandbox Mode
            </span>
            <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {data.policy?.sandboxMode || "strict"}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">
              Mandatory Approvals
            </span>
            <div className="grid grid-cols-1 gap-1">
              {[
                {
                  label: "Shell Execution",
                  enabled: data.policy?.requireHumanApprovalForShell,
                },
                {
                  label: "File Writes",
                  enabled: data.policy?.requireHumanApprovalForFileWrites,
                },
                {
                  label: "External Messages",
                  enabled: data.policy?.requireHumanApprovalForExternalMessages,
                },
                {
                  label: "Purchases",
                  enabled: data.policy?.requireHumanApprovalForPurchases,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded-lg border border-white/5"
                >
                  <span className="text-[10px] text-white/60">
                    {item.label}
                  </span>
                  {item.enabled ? (
                    <CheckCircle2 size={12} className="text-green-500" />
                  ) : (
                    <XCircle size={12} className="text-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities (Skills & Tools) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-brand-purple">
          <Settings size={14} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">
            Capabilities
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-2">
            <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">
              Skills
            </span>
            <div className="text-[10px] text-white/60">
              {data.capabilities?.skills?.length || 0} Enabled
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-2">
            <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">
              Tools
            </span>
            <div className="text-[10px] text-white/60">
              {data.capabilities?.tools?.length || 0} Available
            </div>
          </div>
        </div>
      </section>

      {/* Model & Compute Routing */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-brand-cyan">
          <Cpu size={14} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">
            Model & Compute
          </h3>
        </div>

        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
              Route
            </span>
            <div className="flex items-center gap-2">
              {decision.requiresApproval && (
                <ShieldAlert size={10} className="text-amber-500" />
              )}
              <span
                className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded border uppercase",
                  decision.route === "cloud"
                    ? "text-brand-purple bg-brand-purple/10 border-brand-purple/20"
                    : decision.route === "edge_twin"
                      ? "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20"
                      : decision.route === "device_mesh"
                        ? "text-green-400 bg-green-400/10 border-green-400/20"
                        : "text-white/60 bg-white/5 border-white/10",
                )}
              >
                {decision.route.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter mt-1">
              Reason
            </span>
            <span className="text-[10px] text-white/60 text-right max-w-[200px] leading-tight">
              {decision.reason}
            </span>
          </div>
        </div>
      </section>

      {/* Approval Queue */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertTriangle size={14} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">
            Approval Queue
          </h3>
        </div>

        <OpenClawApprovalQueue blockId={object.id} />
      </section>

      {/* Task Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-brand-purple">
          <div className="flex items-center gap-2">
            <List size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">
              Task Timeline
            </h3>
          </div>
          <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 bg-brand-purple/20 text-brand-purple rounded uppercase">
            {events.length} Events
          </span>
        </div>
        <OpenClawTaskTimeline events={events} />
      </section>
    </div>
  );
};
