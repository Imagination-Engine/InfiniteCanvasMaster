import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import {
  GitBranch,
  Repeat,
  Clock,
  Webhook,
  Box,
  AlertTriangle,
  Layers,
  Bot,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { BaseNodeData } from "./types";

const CONDUCTOR_META: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    accentBorder: string;
    label: string;
  }
> = {
  "conductor.router": {
    icon: GitBranch,
    color: "text-blue-400",
    accentBorder: "border-blue-500/40",
    label: "Router",
  },
  "conductor.forEach": {
    icon: Repeat,
    color: "text-indigo-400",
    accentBorder: "border-indigo-500/40",
    label: "For Each",
  },
  "conductor.delay": {
    icon: Clock,
    color: "text-sky-400",
    accentBorder: "border-sky-500/40",
    label: "Delay",
  },
  "conductor.webhook": {
    icon: Webhook,
    color: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    label: "Webhook",
  },
  "conductor.state": {
    icon: Box,
    color: "text-amber-400",
    accentBorder: "border-amber-500/40",
    label: "State",
  },
  "conductor.errorBoundary": {
    icon: AlertTriangle,
    color: "text-rose-400",
    accentBorder: "border-rose-500/40",
    label: "Error Boundary",
  },
  "conductor.subGraph": {
    icon: Layers,
    color: "text-purple-400",
    accentBorder: "border-purple-500/40",
    label: "Sub-Graph",
  },
  "conductor.agent": {
    icon: Bot,
    color: "text-brand-cyan",
    accentBorder: "border-brand-cyan/40",
    label: "Sub-Agent",
  },
  "conductor.saas": {
    icon: Zap,
    color: "text-brand-purple",
    accentBorder: "border-brand-purple/40",
    label: "SaaS Integration",
  },
};

export default function ConductorNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const nodeData = data as BaseNodeData;

  const meta = CONDUCTOR_META[nodeData.type] ?? {
    icon: GitBranch,
    color: "text-blue-400",
    accentBorder: "border-blue-500/40",
    label: "Conductor Block",
  };
  const NodeIcon = meta.icon;

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: { ...nodeData.inputs, ...(patch.inputs ?? {}) },
      outputs: { ...nodeData.outputs, ...(patch.outputs ?? {}) },
    });
  };

  const items = Array.isArray(nodeData.inputs?.items)
    ? (nodeData.inputs.items as unknown[])
    : [];

  const ms = Number(nodeData.inputs?.ms ?? 1000);
  const delaySeconds = (ms / 1000).toFixed(1);

  return (
    <div
      className={`flex h-full w-full min-h-[220px] min-w-[300px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? `${meta.accentBorder} shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]`
          : `${meta.accentBorder} shadow-inner`
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={220}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-blue-500/30"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-blue-500 transition-all hover:!ring-4 hover:!ring-blue-500/30"
      />

      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg bg-white/5 ${meta.color}`}>
          <NodeIcon size={14} />
        </div>
        <input
          value={nodeData.label}
          onChange={(e) => updateData({ label: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none"
        />
        <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
          Conductor
        </span>
      </div>

      {nodeData.description && (
        <p className="mb-3 text-[11px] font-medium text-brand-text-muted">
          {nodeData.description}
        </p>
      )}

      <div className="nodrag nowheel space-y-3 flex-1 overflow-auto custom-scrollbar">
        {/* Router — condition + visual branches */}
        {nodeData.type === "conductor.router" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Condition
              </span>
              <input
                value={String(nodeData.inputs?.condition ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { condition: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="data.score > 80"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-mono outline-none focus:border-blue-500/50 transition-all text-blue-300 placeholder:text-brand-text-muted/30"
              />
            </label>
            {/* Visual branch display */}
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 text-center">
                ✓ True
              </div>
              <GitBranch size={12} className="text-brand-text-muted shrink-0" />
              <div className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400 text-center">
                ✗ False
              </div>
            </div>
            {nodeData.outputs?.path && (
              <div className="flex items-center gap-1.5 px-2">
                <ArrowRight size={10} className="text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Path: {String(nodeData.outputs.path)}
                </span>
              </div>
            )}
          </>
        )}

        {/* For Each — items count */}
        {nodeData.type === "conductor.forEach" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center">
              Items resolved from upstream
            </div>
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-2xl font-black text-indigo-400 tabular-nums">
                  {items.length}
                </span>
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                  Items
                </span>
              </div>
              <Repeat
                size={16}
                className="text-brand-text-muted animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-2xl font-black text-white tabular-nums">
                  {items.length > 0 ? "∞" : "0"}
                </span>
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                  Iterations
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Delay — ms input + ring visualizer */}
        {nodeData.type === "conductor.delay" && (
          <div className="flex flex-col items-center gap-3">
            <label className="block w-full space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Delay (ms)
              </span>
              <input
                value={String(nodeData.inputs?.ms ?? "")}
                onChange={(e) => updateData({ inputs: { ms: e.target.value } })}
                onKeyDown={(e) => e.stopPropagation()}
                type="number"
                placeholder="1000"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-sky-500/50 transition-all text-white"
              />
            </label>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="rgba(56,189,248,0.6)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${213.63}`}
                  strokeDashoffset={`${213.63 * (1 - Math.min(ms / 10000, 1))}`}
                />
              </svg>
              <div className="text-center">
                <div className="text-lg font-black text-sky-400 tabular-nums leading-none">
                  {delaySeconds}s
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Webhook — URL display */}
        {nodeData.type === "conductor.webhook" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                Listening At
              </span>
              <code className="text-[10px] font-mono text-emerald-300/80 break-all">
                POST /hooks/{id.slice(0, 8)}
              </code>
            </div>
            {nodeData.outputs?.payload && (
              <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 p-3">
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted mb-1">
                  Last Payload
                </span>
                <pre className="text-[9px] font-mono text-brand-cyan/70 overflow-auto max-h-16 custom-scrollbar">
                  {JSON.stringify(nodeData.outputs.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* State — key/value editor */}
        {nodeData.type === "conductor.state" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Key
              </span>
              <input
                value={String(nodeData.inputs?.key ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { key: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="myVariable"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-mono outline-none focus:border-amber-500/50 transition-all text-amber-300 placeholder:text-brand-text-muted/30"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Value
              </span>
              <input
                value={String(nodeData.inputs?.value ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { value: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder='"hello world"'
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-mono outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {nodeData.outputs?.current !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <ArrowRight size={10} className="text-amber-400" />
                <code className="text-[10px] font-mono text-amber-400">
                  {JSON.stringify(nodeData.outputs.current)}
                </code>
              </div>
            )}
          </>
        )}

        {/* Error Boundary */}
        {nodeData.type === "conductor.errorBoundary" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Watching Node ID
              </span>
              <input
                value={String(nodeData.inputs?.node ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { node: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="node-abc123"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-mono outline-none focus:border-rose-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {nodeData.outputs?.error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <span className="block text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">
                  Caught Error
                </span>
                <pre className="text-[9px] font-mono text-rose-300/70 overflow-auto max-h-16">
                  {JSON.stringify(nodeData.outputs.error, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {/* Sub-Graph */}
        {nodeData.type === "conductor.subGraph" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Graph ID
              </span>
              <input
                value={String(nodeData.inputs?.graphId ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { graphId: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="my-sub-workflow"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-mono outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-center">
              <Layers size={24} className="text-purple-400 mx-auto mb-1" />
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                Encapsulated Graph
              </span>
            </div>
          </>
        )}

        {/* Agent */}
        {nodeData.type === "conductor.agent" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Instructions
              </span>
              <textarea
                value={String(nodeData.inputs?.instructions ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { instructions: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                rows={3}
                placeholder="You are a specialist in data analysis..."
                className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-cyan/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {nodeData.outputs?.output && (
              <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-3">
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-cyan mb-1">
                  Agent Output
                </span>
                <div className="text-[11px] font-medium text-brand-text-body leading-relaxed max-h-20 overflow-auto custom-scrollbar">
                  {String(nodeData.outputs.output)}
                </div>
              </div>
            )}
          </>
        )}

        {/* SaaS */}
        {nodeData.type === "conductor.saas" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Provider
              </span>
              <select
                value={String(nodeData.inputs?.provider ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { provider: e.target.value } })
                }
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-purple/50 transition-all text-white appearance-none cursor-pointer"
              >
                {["slack", "notion", "google", "github", "jira", "stripe"].map(
                  (p) => (
                    <option key={p} value={p} className="bg-brand-bg-surface">
                      {p}
                    </option>
                  ),
                )}
              </select>
            </label>
          </>
        )}
      </div>

      {/* Footer tag */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/70">
            Surface B
          </span>
        </div>
        <span className="text-[9px] font-medium text-brand-text-muted">
          {meta.label}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-blue-500 transition-all hover:!ring-4 hover:!ring-blue-500/30"
      />
    </div>
  );
}
