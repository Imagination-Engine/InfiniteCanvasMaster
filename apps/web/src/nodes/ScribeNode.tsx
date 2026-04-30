import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  User,
  Globe,
  MessageSquare,
  CheckCircle,
  PenLine,
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
import { useBlockView } from "../block/ViewRegistry";

const SCRIBE_META: Record<
  string,
  { icon: React.ElementType; color: string; accent: string }
> = {
  "scribe.prose": {
    icon: PenLine,
    color: "text-violet-400",
    accent: "border-violet-500/40",
  },
  "scribe.chapter": {
    icon: BookOpen,
    color: "text-purple-400",
    accent: "border-purple-500/40",
  },
  "scribe.characterProfile": {
    icon: User,
    color: "text-pink-400",
    accent: "border-pink-500/40",
  },
  "scribe.worldLore": {
    icon: Globe,
    color: "text-indigo-400",
    accent: "border-indigo-500/40",
  },
  "scribe.dialogueTree": {
    icon: MessageSquare,
    color: "text-blue-400",
    accent: "border-blue-500/40",
  },
  "scribe.editor": {
    icon: PenLine,
    color: "text-brand-purple",
    accent: "border-brand-purple/40",
  },
  "scribe.proofreader": {
    icon: CheckCircle,
    color: "text-emerald-400",
    accent: "border-emerald-500/40",
  },
};

export default function ScribeNode({ id, data, selected }: NodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
  const { accessToken } = useAuth();

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const meta = SCRIBE_META[nodeData.type] ?? {
    icon: BookOpen,
    color: "text-brand-purple",
    accent: "border-brand-purple/40",
  };
  const NodeIcon = meta.icon;

  // Resolve atomic view from registry
  const BlockView = useBlockView(nodeData.type);

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

  const handleParamsChange = (params: Record<string, unknown>) => {
    updateData({ inputs: { ...nodeData.inputs, ...params } });
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
      className={`flex h-full w-full min-h-[240px] min-w-[320px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? `${meta.accent} shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]`
          : `${meta.accent} shadow-inner`
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

      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-white/5 ${meta.color}`}>
            <NodeIcon size={14} />
          </div>
          <input
            value={nodeData.label}
            onChange={(e) => updateData({ label: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none"
          />
        </div>
        <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
          Scribe
        </span>
      </div>

      {nodeData.description && (
        <p className="mb-3 text-[11px] font-medium leading-relaxed text-brand-text-muted">
          {nodeData.description}
        </p>
      )}

      {/* Atomic View Injection */}
      <div className="nodrag nowheel space-y-3 overflow-auto custom-scrollbar flex-1 pr-1">
        {BlockView ? (
          <BlockView
            id={id}
            data={{
              params: nodeData.inputs || {},
              input: nodeData.inputs,
              output: nodeData.outputs,
              status: running ? "running" : "idle",
            }}
            onParamsChange={handleParamsChange}
            onRun={runNode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 italic text-[10px]">
            No specialized view for {nodeData.type}
          </div>
        )}
      </div>

      {/* Global Run Button */}
      {!BlockView && (
        <button
          type="button"
          onClick={() => void runNode()}
          disabled={running}
          className={`group/btn relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(123,92,234,0.4)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50`}
        >
          <span className="relative z-10">
            {running ? "Writing..." : "Generate"}
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-cyan/30"
      />
    </div>
  );
}
