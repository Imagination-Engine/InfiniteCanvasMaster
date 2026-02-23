import {
  Handle,
  Position,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import { Filter } from "lucide-react";
import React, { useCallback } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FilterNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Conditionally routes data in the flow.
 * Usually has one input (Top) and two outputs (Bottom) for Pass/Reject logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type FilterNodeData = { label: string };

export type FilterNodeType = Node<
  FilterNodeData,
  "filter"
>;

/**
 * FilterNode Component
 *
 * @param id - Node ID for state persistence.
 * @param data - Label data.
 */
export function FilterNode({
  id,
  data,
}: NodeProps<FilterNodeType>) {
  const { updateNodeData } = useReactFlow();

  /**
   * Persists label updates as the user types.
   */
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, {
        label: e.target.value,
      });
    },
    [id, updateNodeData],
  );

  return (
    <div className="flex items-stretch min-w-[160px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
      {/* TARGET HANDLE: Incoming data (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-amber-500 border border-white"
      />

      {/* Amber accent bar indicating 'Filter' logic */}
      <div className="w-1.5 shrink-0 bg-amber-500" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Filter
          </span>
        </div>
        <input
          type="text"
          value={data.label}
          onChange={handleLabelChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-medium text-slate-800 bg-transparent outline-none focus:text-amber-600 transition-colors nowheel nodrag nopan"
          placeholder="Condition Name..."
        />
      </div>

      {/* 
          SOURCE HANDLES: 
          1. "Pass" branch (left-leaning)
          2. "Reject" branch (right-leaning)
      */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="pass"
        style={{ left: "30%" }}
        className="w-2.5 h-2.5 bg-emerald-500 border border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="reject"
        style={{ left: "70%" }}
        className="w-2.5 h-2.5 bg-rose-500 border border-white"
      />
    </div>
  );
}
