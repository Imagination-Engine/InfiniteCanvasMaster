import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
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
    <div className={`min-w-[300px] max-w-[380px] rounded-xl border bg-slate-900/95 p-3 text-slate-100 shadow-lg ${selected ? "border-sky-500" : "border-slate-700"}`}>
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
        <label className="block text-xs">
          <span className="mb-1 block text-slate-400">URL</span>
          <input
            value={url}
            onChange={(event) => updateData({ inputs: { url: event.target.value } })}
            onKeyDown={(event) => event.stopPropagation()}
            className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs outline-none focus:border-sky-500"
            placeholder="https://example.com"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="mt-3 w-full rounded border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
      >
        {running ? "Scraping..." : "Run Node"}
      </button>

      {textOutput && (
        <div className="mt-3 rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-sky-400">Text Output</div>
          <div className="max-h-32 overflow-auto whitespace-pre-wrap">{textOutput}</div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="h-2 w-2 border border-sky-400 bg-sky-500" />
    </div>
  );
}
