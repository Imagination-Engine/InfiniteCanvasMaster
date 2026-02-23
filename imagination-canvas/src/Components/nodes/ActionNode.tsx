import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";

// ─── Type Definition ────────────────────────────────────────────────
export type ActionNodeData = { label: string };
export type ActionNodeType = Node<
  ActionNodeData,
  "action"
>;

/**
 * ActionNode — performs an operation in the flow.
 *
 * - Blue accent bar on the left edge
 * - Both TARGET (top) and SOURCE (bottom) handles — receives input and passes output
 */
export function ActionNode({
  data,
}: NodeProps<ActionNodeType>) {
  return (
    <div className="flex items-stretch min-w-[160px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Receives input from upstream nodes */}
      <Handle
        type="target"
        position={Position.Top}
      />

      {/* Blue accent bar */}
      <div className="w-1.5 shrink-0 bg-blue-500" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Action
        </span>
        <span className="text-sm font-medium text-slate-800">
          {data.label}
        </span>
      </div>

      {/* Passes output downstream */}
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}
