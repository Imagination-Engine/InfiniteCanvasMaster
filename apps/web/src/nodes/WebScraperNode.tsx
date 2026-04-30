import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { Globe, ArrowRight } from "lucide-react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { getNodeIcon } from "./nodeVisuals";
import { setRuntimeNodeInputs, setRuntimeNodeOutputs } from "./workflow/runtimeState";
import { useAuth } from "../auth/AuthContext";

export default function WebScraperNode({ id, data, selected }: NodeProps) {
  const { accessToken } = useAuth();
  const { updateNodeData } = useReactFlow();
  const [running, setRunning] = useState(false);

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const NodeIcon = getNodeIcon(nodeData.type);

  if (!definition) {
    return (
      <div className="min-w-[260px] rounded-2xl border border-rose-500/30 bg-brand-bg-surface/90 backdrop-blur-xl p-4 text-[11px] font-bold uppercase tracking-widest text-rose-300 shadow-2xl">
        Unknown node type: {nodeData.type}
      </div>
    );
  }

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: {
        ...nodeData.inputs,
        ...(patch.inputs ?? {}),
      },
      config: {
        ...(nodeData.config ?? {}),
        ...(patch.config ?? {}),
      },
      outputs: {
        ...(nodeData.outputs ?? {}),
        ...(patch.outputs ?? {}),
      },
    });
  };

  const runNode = async () => {
    setRunning(true);
    try {
      const executionInputs = {
        url: String(nodeData.inputs.url ?? ""),
      };

      setRuntimeNodeInputs(id, executionInputs);

      const output = await runCreativeNode(nodeData.type, executionInputs, nodeData.config ?? {}, accessToken);
      updateData({ outputs: output });
      setRuntimeNodeOutputs(id, output);
    } finally {
      setRunning(false);
    }
  };

  const url = typeof nodeData.inputs.url === "string" ? nodeData.inputs.url : "";
  const textOutput = typeof nodeData.outputs?.text === "string" ? nodeData.outputs.text : "";

  return (
    <div className={`min-w-[320px] flex h-full w-full min-h-[220px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${selected ? "border-brand-purple shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]" : "border-brand-purple/40 shadow-inner"}`}>
      <NodeResizer 
        isVisible={selected} 
        minWidth={320} 
        minHeight={220}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-brand-purple/30"
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex w-full items-center gap-2.5 group/label">
          <NodeIcon className="h-4 w-4 text-brand-purple group-hover/label:text-brand-cyan transition-colors" />
          <input
            value={nodeData.label}
            onChange={(event) => updateData({ label: event.target.value })}
            onKeyDown={(event) => event.stopPropagation()}
            className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none placeholder:text-brand-text-muted/50"
          />
        </div>
        <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
          {definition.category}
        </span>
      </div>

      {nodeData.description ? (
        <p className="mb-4 text-[11px] font-medium leading-relaxed text-brand-text-muted">{nodeData.description}</p>
      ) : null}

      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">URL</span>
          <div className="relative group/input">
            <input
              value={url}
              onChange={(event) => updateData({ inputs: { url: event.target.value } })}
              onKeyDown={(event) => event.stopPropagation()}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium text-white outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all placeholder:text-brand-text-muted/30"
              placeholder="https://example.com"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-muted">
              <Globe size={10} />
            </div>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="group/btn relative mt-5 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(123,92,234,0.4)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        <span className="relative z-10">{running ? "Synchronising..." : "Run Node"}</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      {textOutput && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-brand-bg-page/80 p-4 shadow-inner group/out">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-purple group-hover/out:text-brand-cyan transition-colors">
            <ArrowRight size={10} />
            Text Output
          </div>
          <div className="max-h-32 overflow-auto whitespace-pre-wrap text-[11px] font-medium leading-relaxed text-brand-text-body custom-scrollbar">{textOutput}</div>
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-cyan/30 group-hover:!scale-110" 
      />
    </div>
  );
}
