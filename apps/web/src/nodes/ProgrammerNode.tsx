import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import { Code, ArrowRight } from "lucide-react";
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

export default function ProgrammerNode({ id, data, selected }: NodeProps) {
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

  const generatedCode = nodeData.outputs?.generatedCode as string | undefined;

  return (
    <div
      className={`flex h-full w-full min-h-[240px] min-w-[320px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? "border-brand-purple shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]"
          : "border-brand-purple/40 shadow-inner"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={320}
        minHeight={240}
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
            <Code size={14} />
          </div>
          <input
            value={nodeData.label}
            onChange={(e) => updateData({ label: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none"
          />
        </div>
      </div>

      <div className="nodrag nowheel space-y-3 flex-1 overflow-auto custom-scrollbar">
        <label className="block space-y-1.5">
          <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">
            Prompt
          </span>
          <textarea
            value={String(nodeData.inputs?.prompt ?? "")}
            onChange={(e) => updateData({ inputs: { prompt: e.target.value } })}
            onKeyDown={(e) => e.stopPropagation()}
            rows={2}
            placeholder="Generate a React component for..."
            className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium text-white outline-none focus:border-brand-purple/50 transition-all placeholder:text-brand-text-muted/30"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">
            Initial Code (Optional)
          </span>
          <textarea
            value={String(nodeData.inputs?.code ?? "")}
            onChange={(e) => updateData({ inputs: { code: e.target.value } })}
            onKeyDown={(e) => e.stopPropagation()}
            rows={2}
            placeholder="Existing code to refactor..."
            className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-mono text-emerald-300/80 outline-none focus:border-brand-purple/50 transition-all placeholder:text-brand-text-muted/30"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="group/btn relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(123,92,234,0.4)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10">
          {running ? "Coding..." : "Generate Code"}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      {generatedCode && (
        <div className="mt-3 rounded-2xl border border-white/5 bg-black/60 p-3 shadow-inner">
          <div className="mb-1.5 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-cyan">
            <ArrowRight size={10} />
            Generated Output
          </div>
          <pre className="text-[10px] font-mono text-emerald-300/80 overflow-auto max-h-40 custom-scrollbar leading-relaxed whitespace-pre-wrap break-words">
            {generatedCode}
          </pre>
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
