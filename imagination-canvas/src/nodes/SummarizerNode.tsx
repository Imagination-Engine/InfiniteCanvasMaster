import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { useState, useRef } from "react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { getNodeIcon } from "./nodeVisuals";
import { Plus, X, Upload } from "lucide-react";

export default function SummarizerNode({ id, data, selected }: NodeProps) {
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
      const output = await runCreativeNode(nodeData.type, nodeData.inputs, nodeData.config ?? {});
      updateData({ outputs: output });
    } finally {
      setRunning(false);
    }
  };

  const sources = Array.isArray(nodeData.inputs.sources) 
    ? nodeData.inputs.sources.map(String) 
    : [""];
    
  const additionalInstructions = typeof nodeData.config?.additionalInstructions === "string" 
    ? nodeData.config.additionalInstructions 
    : "";
  
  const summary = typeof nodeData.outputs?.summary === "string" ? nodeData.outputs.summary : "";
  const analysis = typeof nodeData.outputs?.analysis === "string" ? nodeData.outputs.analysis : "";

  const updateSource = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    updateData({ inputs: { sources: newSources } });
  };

  const handleFileUpload = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      // Store in a format the service can recognize as an image:
      // data:image/png;base64,iVBORw0KGg...
      updateSource(index, base64Data);
    };
    reader.readAsDataURL(file);
  };

  const addSource = () => {
    if (sources.length >= 6) return;
    updateData({ inputs: { sources: [...sources, ""] } });
  };

  const removeSource = (indexToRemove: number) => {
    if (sources.length <= 1) return;
    const newSources = sources.filter((_, index) => index !== indexToRemove);
    updateData({ inputs: { sources: newSources } });
  };

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
        <div className="space-y-2">
          {sources.map((source, index) => {
            const isImage = source.startsWith("data:image/");
            
            return (
              <div key={`source-${index}`} className="block text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="block text-slate-400">Source {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <label className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-sky-400">
                      <Upload className="h-3 w-3" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(index, file);
                        }}
                      />
                    </label>
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                        title="Remove source"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                {isImage ? (
                  <div className="relative overflow-hidden rounded border border-slate-700 bg-slate-950 p-1">
                    <img 
                      src={source} 
                      alt={`Source ${index + 1}`} 
                      className="max-h-32 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => updateSource(index, "")}
                      className="absolute right-2 top-2 rounded bg-slate-900/80 p-1 text-slate-300 hover:text-rose-400"
                      title="Clear image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <textarea
                    value={source}
                    onChange={(event) => updateSource(index, event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    rows={3}
                    className="w-full resize-y rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-sky-500"
                    placeholder="Text or image base64..."
                  />
                )}
              </div>
            );
          })}
        </div>

        {sources.length < 6 && (
          <button
            type="button"
            onClick={addSource}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-slate-700 py-1.5 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-300"
          >
            <Plus className="h-3 w-3" />
            Add Source
          </button>
        )}

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