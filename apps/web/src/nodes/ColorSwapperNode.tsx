import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import { Image as ImageIcon, ArrowRight, Palette } from "lucide-react";
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

export default function ColorSwapperNode({ id, data, selected }: NodeProps) {
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

  return (
    <div
      className={`flex h-full w-full min-h-[220px] min-w-[300px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? "border-brand-purple shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]"
          : "border-brand-purple/40 shadow-inner"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={220}
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
            <Palette size={14} />
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
            Primary Image URL
          </span>
          <input
            value={String(nodeData.inputs?.imagePrimary ?? "")}
            onChange={(e) =>
              updateData({ inputs: { imagePrimary: e.target.value } })
            }
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="https://example.com/target.png"
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium text-white outline-none focus:border-brand-purple/50 transition-all placeholder:text-brand-text-muted/30"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">
            Palette Source Image URL
          </span>
          <input
            value={String(nodeData.inputs?.imagePaletteSource ?? "")}
            onChange={(e) =>
              updateData({ inputs: { imagePaletteSource: e.target.value } })
            }
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="https://example.com/colors.png"
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium text-white outline-none focus:border-brand-purple/50 transition-all placeholder:text-brand-text-muted/30"
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
          {running ? "Swapping..." : "Swap Palette"}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      {nodeData.outputs?.image && (
        <div className="mt-3 rounded-2xl border border-white/5 bg-brand-bg-page/80 p-2 shadow-inner">
          <div className="mb-1.5 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-cyan">
            <ImageIcon size={10} />
            Swapped Result
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/20 border border-white/5">
            <img
              src={String(nodeData.outputs.image)}
              alt="Swapped"
              className="h-full w-full object-cover"
            />
          </div>
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
