import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "./canvasTypes";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { runIntegrationNode, runTriggerNode } from "../services/integrations/workflowService";
import { getNodeIcon } from "./nodeVisuals";
import { getNodeInputs } from "./workflow/inputResolution";
import { getRuntimeState, setRuntimeNodeInputs, setRuntimeNodeOutputs } from "./workflow/runtimeState";
import { useAuth } from "../auth/AuthContext";

const toText = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value ?? ""));

export default function BaseNode({ id, data, selected }: NodeProps) {
  const { accessToken } = useAuth();
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const NodeIcon = getNodeIcon(nodeData.type);
  const canExecute = nodeData.type !== "fileUpload";

  const canReceiveInput = useMemo(
    () => Boolean(definition && Object.keys(definition.inputSchema).length > 0),
    [definition],
  );

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

      if (definition.category === "creative") {
        const output = await runCreativeNode(nodeData.type, executionInputs, nodeData.config ?? {}, accessToken);
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      } else if (definition.role === "trigger") {
        const output = await runTriggerNode(nodeData.type, nodeData.config ?? {}, executionInputs);
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      } else {
        const output = await runIntegrationNode(nodeData.type, executionInputs, nodeData.config ?? {});
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={`min-w-[280px] max-w-[360px] rounded-xl border bg-slate-900/95 p-3 text-slate-100 shadow-lg ${selected ? "border-sky-500" : "border-slate-700"}`}>
      {canReceiveInput ? (
        <Handle type="target" position={Position.Top} className="h-2 w-2 border border-slate-400 bg-slate-100" />
      ) : null}

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

      <div className="space-y-2">
        {Object.keys(definition.inputSchema).filter((key) => key !== "source").map((key) => (
          <label key={key} className="block text-xs">
            <span className="mb-1 block text-slate-400">{key}</span>
            <input
              value={toText(nodeData.inputs[key] ?? "")}
              onChange={(event) => updateData({ inputs: { [key]: event.target.value } })}
              onKeyDown={(event) => event.stopPropagation()}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-sky-500"
            />
          </label>
        ))}

        {Object.keys(nodeData.config ?? {}).map((key) => (
          <label key={key} className="block text-xs">
            <span className="mb-1 block text-slate-400">{key}</span>
            <textarea
              value={toText(nodeData.config?.[key] ?? "")}
              onChange={(event) => updateData({ config: { [key]: event.target.value } })}
              onKeyDown={(event) => event.stopPropagation()}
              rows={key === "additionalInstructions" ? 3 : 2}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-sky-500"
            />
          </label>
        ))}
      </div>

      {canExecute ? (
        <button
          type="button"
          onClick={() => void runNode()}
          disabled={running}
          className="mt-3 w-full rounded border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
        >
          {running ? "Running..." : definition.role === "trigger" ? "Emit Trigger" : "Run Node"}
        </button>
      ) : (
        <div className="mt-3 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-400">
          Static upload node
        </div>
      )}

      <details className="mt-2 text-xs text-slate-400">
        <summary className="cursor-pointer">Outputs</summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-950 p-2 text-[11px] text-slate-300">{JSON.stringify(nodeData.outputs ?? {}, null, 2)}</pre>
      </details>

      <Handle type="source" position={Position.Bottom} className="h-2 w-2 border border-sky-400 bg-sky-500" />
    </div>
  );
}
