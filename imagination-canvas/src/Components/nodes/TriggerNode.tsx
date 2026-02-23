import {
  Handle,
  Position,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import { Zap } from "lucide-react";
import React, { useCallback } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TriggerNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The starting point of any automation or flow.
 * Note: It only has a SOURCE handle as it doesn't receive input.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type TriggerNodeData = { label: string };

export type TriggerNodeType = Node<
  TriggerNodeData,
  "trigger"
>;

/**
 * TriggerNode Component
 *
 * @param id - Node ID for state persistence.
 * @param data - Label data.
 */
export function TriggerNode({
  id,
  data,
}: NodeProps<TriggerNodeType>) {
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
      {/* Emerald accent bar indicating 'Trigger' type */}
      <div className="w-1.5 shrink-0 bg-emerald-500" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Trigger
          </span>
        </div>
        <input
          type="text"
          value={data.label}
          onChange={handleLabelChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-medium text-slate-800 bg-transparent outline-none focus:text-emerald-600 transition-colors nowheel nodrag nopan"
          placeholder="Event Name..."
        />
      </div>

      {/* 
          SOURCE HANDLE: Triggers only fire events downstream (Bottom)
      */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-emerald-500 border border-white"
      />
    </div>
  );
}
