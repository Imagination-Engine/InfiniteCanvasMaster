import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "./canvasTypes";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { getNodeIcon } from "./nodeVisuals";
import { getNodeInputs } from "./workflow/inputResolution";
import { getRuntimeState, setRuntimeNodeInputs, setRuntimeNodeOutputs } from "./workflow/runtimeState";

export default function SummarizerNode({ id, data, selected }: NodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const NodeIcon = getNodeIcon(nodeData.type);

  if (!definition) {
    return (
      <div className="min-w-[260px] rounded-lg border border-rose-500/60 bg-slate-900 p-3 text-xs text-rose-300">
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
      const upstreamInputs = getNodeInputs(
        id,
        getNodes() as UnifiedCanvasNode[],
        getEdges() as UnifiedCanvasEdge[],
        getRuntimeState(),
      );
      const manualInputsWithoutSource = Object.fromEntries(
        Object.entries(nodeData.inputs).filter(([key]) => key !== "source"),
      );
      const executionInputs = {
        ...manualInputsWithoutSource,
        ...upstreamInputs,
      };

      setRuntimeNodeInputs(id, upstreamInputs);

      const output = await runCreativeNode(nodeData.type, executionInputs, nodeData.config ?? {});
      updateData({ outputs: output });
      setRuntimeNodeOutputs(id, output);
    } finally {
      setRunning(false);
    }
  };

  const additionalInstructions = typeof nodeData.config?.additionalInstructions === "string"
    ? nodeData.config.additionalInstructions
    : "";

  const summary = typeof nodeData.outputs?.summary === "string" ? nodeData.outputs.summary : "";
  const analysis = typeof nodeData.outputs?.analysis === "string" ? nodeData.outputs.analysis : "";

  return (
    <div className={`min-w-[320px] max-w-[420px] rounded-xl border bg-slate-900/95 p-3 text-slate-100 shadow-lg ${selected ? "border-sky-500" : "border-slate-700"}`}>
      <Handle type="target" position={Position.Top} className="h-2 w-2 border border-slate-400 bg-slate-100" />

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex w-full items-center gap-2">
          <NodeIcon className="h-4 w-4 text-sky-300" />
          <input
            value={nodeData.label}
            onChange={(event) => updateData({ label: event.target.value })}
            onKeyDown={(event) => event.stopPropagation()}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
          {definition.category}
        </span>
      </div>

      {nodeData.description ? (
        <p className="mb-3 text-xs text-slate-400">{nodeData.description}</p>
      ) : null}

      <div className="space-y-3">
        <div className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-400">
          Source is resolved from connected upstream nodes.
        </div>

        <label className="block text-xs">
          <span className="mb-1 block text-slate-400">Additional Instructions</span>
          <textarea
            value={additionalInstructions}
            onChange={(event) => updateData({ config: { additionalInstructions: event.target.value } })}
            onKeyDown={(event) => event.stopPropagation()}
            rows={2}
            className="w-full resize-y rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-sky-500"
            placeholder="Focus on action items, make it brief, etc."
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="mt-3 w-full rounded border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
      >
        {running ? "Summarizing..." : "Run Node"}
      </button>

      {summary && (
        <div className="mt-3 rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-sky-400">Summary</div>
          <div className="whitespace-pre-wrap">{summary}</div>
        </div>
      )}

      {analysis && (
        <div className="mt-2 rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400">Analysis</div>
          <div className="whitespace-pre-wrap">{analysis}</div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="h-2 w-2 border border-sky-400 bg-sky-500" />
    </div>
  );
}
