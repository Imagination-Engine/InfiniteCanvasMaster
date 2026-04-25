import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import {
  Film,
  Layers,
  User,
  Sparkles,
  Download,
  ArrowRight,
  Play,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "./canvasTypes";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { getNodeInputs } from "./workflow/inputResolution";
import {
  getRuntimeState,
  setRuntimeNodeInputs,
  setRuntimeNodeOutputs,
} from "./workflow/runtimeState";

const REEL_META: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  "reel.timeline": { icon: Film, color: "text-rose-400", label: "Timeline" },
  "reel.scene": { icon: Layers, color: "text-orange-400", label: "Scene" },
  "reel.character": { icon: User, color: "text-pink-400", label: "Character" },
  "reel.vfx": { icon: Sparkles, color: "text-yellow-400", label: "VFX" },
  "reel.transition": {
    icon: Play,
    color: "text-amber-400",
    label: "Transition",
  },
  "reel.export": { icon: Download, color: "text-emerald-400", label: "Export" },
};

const TRANSITION_TYPES = ["fade", "cut", "wipe", "dissolve", "zoom", "slide"];
const VFX_TYPES = [
  "bloom",
  "color-grade",
  "lens-flare",
  "grain",
  "vignette",
  "glitch",
];
const EXPORT_FORMATS = ["mp4", "webm", "gif", "mov", "avi"];

export default function ReelNode({ id, data, selected }: NodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
  const { accessToken } = useAuth();

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const meta = REEL_META[nodeData.type] ?? {
    icon: Film,
    color: "text-rose-400",
    label: "Reel Block",
  };
  const NodeIcon = meta.icon;

  if (!definition) return null;

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: { ...nodeData.inputs, ...(patch.inputs ?? {}) },
      outputs: { ...nodeData.outputs, ...(patch.outputs ?? {}) },
    });
  };

  const runNode = async () => {
    setRunning(true);
    try {
      const upstreamInputs = getNodeInputs(
        id,
        getNodes() as UnifiedCanvasNode[],
        getEdges() as UnifiedCanvasEdge[],
        getRuntimeState(),
      );
      const executionInputs = { ...nodeData.inputs, ...upstreamInputs };
      setRuntimeNodeInputs(id, upstreamInputs);
      const output = await runCreativeNode(
        nodeData.type,
        executionInputs,
        nodeData.config ?? {},
        accessToken,
      );
      updateData({ outputs: output });
      setRuntimeNodeOutputs(id, output);
    } finally {
      setRunning(false);
    }
  };

  // Timeline events as an array for display
  const events = Array.isArray(nodeData.inputs?.events)
    ? (nodeData.inputs.events as Array<{ name: string; duration?: number }>)
    : [];

  const fileUrl = nodeData.outputs?.fileUrl as string | undefined;

  return (
    <div
      className={`flex h-full w-full min-h-[240px] min-w-[320px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? "border-rose-500/50 shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)]"
          : "border-rose-500/20 shadow-inner"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={320}
        minHeight={240}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-rose-500/30"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-rose-500 transition-all hover:!ring-4 hover:!ring-rose-500/30"
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
          Reel
        </span>
      </div>

      {nodeData.description && (
        <p className="mb-3 text-[11px] font-medium text-brand-text-muted">
          {nodeData.description}
        </p>
      )}

      <div className="nodrag nowheel space-y-3 flex-1 overflow-auto custom-scrollbar">
        {/* Timeline — mini horizontal track */}
        {nodeData.type === "reel.timeline" && (
          <div className="space-y-3">
            {/* Mini timeline visual */}
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/60 p-3">
              <span className="block text-[9px] font-black uppercase tracking-widest text-rose-400 mb-2">
                Timeline Track
              </span>
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                {events.length === 0 ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center px-3"
                        style={{ width: `${60 + i * 10}px` }}
                      >
                        <span className="text-[8px] font-bold text-brand-text-muted">
                          Scene {i}
                        </span>
                      </div>
                    ))}
                    <div className="h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/30 flex-shrink-0 flex items-center justify-center px-3 w-14">
                      <span className="text-[8px] font-bold text-brand-purple">
                        END
                      </span>
                    </div>
                  </>
                ) : (
                  events.map((ev, i) => (
                    <div
                      key={i}
                      className="h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex-shrink-0 flex items-center justify-center px-3"
                      style={{ minWidth: "60px" }}
                    >
                      <span className="text-[8px] font-bold text-rose-300 truncate max-w-[80px]">
                        {ev.name ?? `Event ${i + 1}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {/* Playhead */}
              <div className="mt-1 h-0.5 bg-gradient-to-r from-rose-500 to-transparent rounded-full w-1/3" />
            </div>
          </div>
        )}

        {/* Scene — description + metadata */}
        {nodeData.type === "reel.scene" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Scene Description
              </span>
              <textarea
                value={String(nodeData.inputs?.description ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { description: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                rows={3}
                placeholder="A dimly lit library at midnight, books floating..."
                className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-orange-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {nodeData.outputs?.sceneData && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                <span className="block text-[9px] font-black uppercase tracking-widest text-orange-400 mb-1">
                  Scene Metadata
                </span>
                <pre className="text-[9px] font-mono text-orange-300/70 overflow-auto max-h-16 custom-scrollbar">
                  {JSON.stringify(nodeData.outputs.sceneData, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {/* Character */}
        {nodeData.type === "reel.character" && (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center shrink-0">
              <User size={24} className="text-pink-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center">
                Profile from upstream
              </div>
              {nodeData.outputs?.entity && (
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={10} className="text-pink-400" />
                  <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">
                    Entity Bound
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VFX — type picker */}
        {nodeData.type === "reel.vfx" && (
          <label className="block space-y-1.5">
            <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
              VFX Effect
            </span>
            <div className="grid grid-cols-3 gap-1">
              {VFX_TYPES.map((fx) => (
                <button
                  key={fx}
                  type="button"
                  onClick={() => updateData({ inputs: { effect: fx } })}
                  className={`py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    nodeData.inputs?.effect === fx
                      ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
                      : "bg-white/[0.02] border border-white/10 text-brand-text-muted hover:border-yellow-500/30"
                  }`}
                >
                  {fx}
                </button>
              ))}
            </div>
          </label>
        )}

        {/* Transition — type picker */}
        {nodeData.type === "reel.transition" && (
          <label className="block space-y-1.5">
            <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
              Transition Type
            </span>
            <div className="grid grid-cols-3 gap-1">
              {TRANSITION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateData({ inputs: { type: t } })}
                  className={`py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    nodeData.inputs?.type === t
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                      : "bg-white/[0.02] border border-white/10 text-brand-text-muted hover:border-amber-500/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </label>
        )}

        {/* Export — format picker + download */}
        {nodeData.type === "reel.export" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Export Format
              </span>
              <div className="flex gap-1 flex-wrap">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => updateData({ inputs: { format: fmt } })}
                    className={`py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      nodeData.inputs?.format === fmt
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                        : "bg-white/[0.02] border border-white/10 text-brand-text-muted hover:border-emerald-500/30"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </label>
            {fileUrl && (
              <a
                href={fileUrl}
                download
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
              >
                <Download size={12} />
                Download {String(nodeData.inputs?.format ?? "file")}
              </a>
            )}
          </>
        )}
      </div>

      {/* Run Button */}
      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="group/btn relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(244,63,94,0.3)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(244,63,94,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10">
          {running ? "Rendering..." : "Render"}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-rose-500 transition-all hover:!ring-4 hover:!ring-rose-500/30"
      />
    </div>
  );
}
