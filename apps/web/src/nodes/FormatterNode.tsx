import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";
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

export default function FormatterNode({ id, data, selected }: NodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
  const { accessToken } = useAuth();

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];

  if (!definition) return null;

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: { ...nodeData.inputs, ...(patch.inputs ?? {}) },
      config: { ...(nodeData.config ?? {}), ...(patch.config ?? {}) },
      outputs: { ...(nodeData.outputs ?? {}), ...(patch.outputs ?? {}) },
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

  const formats = ["json", "xml", "csv", "markdown", "text", "html"];

  return (
    <div
      className={`flex h-full w-full min-h-[200px] min-w-[280px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? "border-brand-purple shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]"
          : "border-brand-purple/40 shadow-inner"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={200}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-brand-purple/30"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-purple transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-purple/30"
      />

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/5 text-brand-purple">
            <FileText size={14} />
          </div>
          <input
            value={nodeData.label}
            onChange={(e) => updateData({ label: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none"
          />
        </div>
      </div>

      <div className="nodrag nowheel space-y-3 flex-1">
        <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center">
          File/Content resolved from upstream
        </div>

        <label className="block space-y-1.5">
          <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">
            Desired Format
          </span>
          <div className="flex flex-wrap gap-1">
            {formats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => updateData({ inputs: { desiredFormat: fmt } })}
                className={`py-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  nodeData.inputs?.desiredFormat === fmt
                    ? "bg-brand-purple text-white shadow-lg"
                    : "bg-white/5 text-brand-text-muted hover:bg-white/10"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="group/btn relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(123,92,234,0.4)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10">
          {running ? "Formatting..." : "Format"}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      {nodeData.outputs?.formattedFile && (
        <div className="mt-3 flex items-center gap-2 px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <ArrowRight size={10} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            File Formatted
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-cyan/30"
      />
    </div>
  );
}
