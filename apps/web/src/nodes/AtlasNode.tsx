import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState, useCallback } from "react";
import {
  Database,
  Upload,
  Search,
  Network,
  ArrowRight,
  CheckCircle,
  Route,
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

const ATLAS_META: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  "atlas.documentLoader": {
    icon: Upload,
    color: "text-sky-400",
    label: "Doc Loader",
  },
  "atlas.chunker": {
    icon: Database,
    color: "text-indigo-400",
    label: "Chunker",
  },
  "atlas.vectorSearch": {
    icon: Search,
    color: "text-brand-purple",
    label: "Vector Search",
  },
  "atlas.graphKnowledge": {
    icon: Network,
    color: "text-brand-cyan",
    label: "Graph Knowledge",
  },
  "atlas.indexer": {
    icon: Database,
    color: "text-emerald-400",
    label: "Indexer",
  },
  "atlas.semanticRouter": {
    icon: Route,
    color: "text-orange-400",
    label: "Semantic Router",
  },
};

export default function AtlasNode({ id, data, selected }: NodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { accessToken } = useAuth();

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const meta = ATLAS_META[nodeData.type] ?? {
    icon: Database,
    color: "text-brand-cyan",
    label: "Atlas Block",
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

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        updateData({
          inputs: { url: `file://${file.name}`, _fileName: file.name },
        });
      }
    },
    [nodeData],
  );

  if (!definition) return null;

  const chunks = Array.isArray(nodeData.outputs?.chunks)
    ? (nodeData.outputs.chunks as string[])
    : [];
  const matches = Array.isArray(nodeData.outputs?.matches)
    ? (nodeData.outputs.matches as Array<{ text: string; score?: number }>)
    : [];
  const routeResult = nodeData.outputs?.route as string | undefined;
  const indexSuccess = nodeData.outputs?.success as boolean | undefined;

  return (
    <div
      className={`flex h-full w-full min-h-[240px] min-w-[320px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? "border-brand-cyan/50 shadow-[0_0_30px_-5px_rgba(0,194,255,0.2)]"
          : "border-brand-cyan/20 shadow-inner"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={320}
        minHeight={240}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-brand-cyan/30"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all hover:!ring-4 hover:!ring-brand-cyan/30"
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
          Atlas
        </span>
      </div>

      {nodeData.description && (
        <p className="mb-3 text-[11px] font-medium text-brand-text-muted">
          {nodeData.description}
        </p>
      )}

      <div className="nodrag nowheel space-y-3 flex-1 overflow-auto custom-scrollbar">
        {/* Document Loader — Drop Zone */}
        {nodeData.type === "atlas.documentLoader" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-sky-400 bg-sky-400/10"
                : "border-white/10 hover:border-sky-500/40 hover:bg-white/[0.02]"
            }`}
          >
            <Upload
              size={20}
              className={`mx-auto mb-2 ${isDragging ? "text-sky-400" : "text-brand-text-muted"}`}
            />
            <p className="text-[10px] font-bold text-brand-text-muted">
              {(nodeData.inputs?._fileName as string) ||
                "Drop a file or enter URL"}
            </p>
          </div>
        )}
        {nodeData.type === "atlas.documentLoader" && (
          <label className="block space-y-1.5">
            <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
              Or URL
            </span>
            <input
              value={String(nodeData.inputs?.url ?? "")}
              onChange={(e) => updateData({ inputs: { url: e.target.value } })}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="https://example.com/doc.pdf"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
            />
          </label>
        )}

        {/* Vector Search — query + results table */}
        {nodeData.type === "atlas.vectorSearch" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Query
              </span>
              <input
                value={String(nodeData.inputs?.query ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { query: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="What were the key findings?"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-purple/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {matches.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 overflow-hidden">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-cyan border-b border-white/5">
                  {matches.length} Matches
                </div>
                <div className="divide-y divide-white/5 max-h-32 overflow-auto custom-scrollbar">
                  {matches.map((m, i) => (
                    <div key={i} className="px-3 py-2 flex items-start gap-2">
                      <span className="text-[9px] font-black text-brand-cyan/60 tabular-nums mt-0.5 shrink-0">
                        {m.score !== undefined
                          ? `${(m.score * 100).toFixed(0)}%`
                          : `#${i + 1}`}
                      </span>
                      <span className="text-[10px] font-medium text-brand-text-body line-clamp-2">
                        {m.text ?? JSON.stringify(m)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Graph Knowledge */}
        {nodeData.type === "atlas.graphKnowledge" && (
          <label className="block space-y-1.5">
            <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
              Entity
            </span>
            <input
              value={String(nodeData.inputs?.entity ?? "")}
              onChange={(e) =>
                updateData({ inputs: { entity: e.target.value } })
              }
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Elon Musk"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-cyan/50 transition-all text-white placeholder:text-brand-text-muted/30"
            />
          </label>
        )}

        {/* Chunker — text input + chunk preview */}
        {nodeData.type === "atlas.chunker" && (
          <>
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center">
              Text resolved from upstream
            </div>
            {chunks.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 p-2">
                <span className="block text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                  {chunks.length} Chunks
                </span>
                <div className="space-y-1 max-h-24 overflow-auto custom-scrollbar">
                  {chunks.slice(0, 5).map((chunk, i) => (
                    <div
                      key={i}
                      className="text-[9px] font-medium text-brand-text-muted bg-white/[0.02] px-2 py-1 rounded-lg truncate"
                    >
                      [{i + 1}] {chunk}
                    </div>
                  ))}
                  {chunks.length > 5 && (
                    <div className="text-[9px] text-brand-text-muted/50 text-center">
                      +{chunks.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Indexer */}
        {nodeData.type === "atlas.indexer" && (
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center w-full">
              Chunks resolved from upstream
            </div>
            {indexSuccess !== undefined && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  indexSuccess
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}
              >
                <CheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {indexSuccess ? "Indexed Successfully" : "Index Failed"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Semantic Router */}
        {nodeData.type === "atlas.semanticRouter" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Input
              </span>
              <input
                value={String(nodeData.inputs?.input ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { input: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="I want to book a flight to Paris..."
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-orange-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {routeResult && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <ArrowRight size={12} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Route: {routeResult}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Run Button */}
      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="group/btn relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(0,194,255,0.3)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10">
          {running ? "Processing..." : "Run"}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all hover:!ring-4 hover:!ring-brand-cyan/30"
      />
    </div>
  );
}
