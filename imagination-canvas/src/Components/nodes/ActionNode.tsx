import {
  Handle,
  Position,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import { Play } from "lucide-react";
import React, { useCallback } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ActionNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Represents a functional step or operation within a flow.
 * Usually has both input and output handles.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ActionNodeData = { label: string };

export type ActionNodeType = Node<
  ActionNodeData,
  "action"
>;

/**
 * ActionNode Component
 *
 * @param id - Node ID for state persistence.
 * @param data - Label data.
 */
export function ActionNode({
  id,
  data,
}: NodeProps<ActionNodeType>) {
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
      {/* TARGET HANDLE: Input from upstream (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-blue-500 border border-white"
      />

      {/* Blue accent bar indicating 'Action' type */}
      <div className="w-1.5 shrink-0 bg-blue-500" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Play className="w-3 h-3 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Action
          </span>
        </div>
        <input
          type="text"
          value={data.label}
          onChange={handleLabelChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-medium text-slate-800 bg-transparent outline-none focus:text-blue-600 transition-colors nowheel nodrag nopan"
          placeholder="Task Name..."
        />
      </div>

      {/* SOURCE HANDLE: Output to downstream (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-blue-500 border border-white"
      />
    </div>
  );
}
