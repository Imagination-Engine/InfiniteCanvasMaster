import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback } from "react";
import { Sparkles } from "lucide-react";

export type SummaryAgentNodeData = {
  label: string;
  summary?: string;
};

export type SummaryAgentNodeType = Node<
  SummaryAgentNodeData,
  "summaryAgentNode"
>;

export function SummaryAgentNode({
  id,
  data,
}: NodeProps<SummaryAgentNodeType>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: e.target.value });
    },
    [id, updateNodeData],
  );

  const runSummary = useCallback(() => {
    updateNodeData(id, {
      summary:
        "Likely drivers: recurring essentials + food spikes. Review large yellow transfer nodes before month-end.",
    });
  }, [id, updateNodeData]);

  return (
    <div className="relative flex min-w-[250px] max-w-[300px] flex-col rounded-2xl border border-indigo-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-indigo-500"
      />

      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
          Summary Agent
        </span>
      </div>

      <input
        type="text"
        value={data.label}
        onChange={handleLabelChange}
        onKeyDown={(event) => event.stopPropagation()}
        className="nodrag nopan nowheel mb-2 rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold outline-none focus:border-indigo-300"
        placeholder="Node label"
      />

      <button
        onClick={runSummary}
        className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-600"
      >
        Run Summary
      </button>

      <p className="mt-2 min-h-10 text-xs leading-relaxed text-slate-600">
        {data.summary ?? "Connect spend/income nodes and run a quick narrative summary."}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-indigo-500"
      />
    </div>
  );
}
