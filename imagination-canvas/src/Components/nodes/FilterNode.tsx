import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";

// ─── Type Definition ────────────────────────────────────────────────
export type FilterNodeData = { label: string };
export type FilterNodeType = Node<
  FilterNodeData,
  "filter"
>;

/**
 * FilterNode — conditionally routes data in the flow.
 *
 * - Amber accent bar on the left edge
 * - TARGET handle (top) for incoming data
 * - Two SOURCE handles (bottom-left, bottom-right) for "pass" and "reject" branches
 */
export function FilterNode({
  data,
}: NodeProps<FilterNodeType>) {
  return (
    <div className="flex items-stretch min-w-[160px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Incoming data */}
      <Handle
        type="target"
        position={Position.Top}
      />

      {/* Amber accent bar */}
      <div className="w-1.5 shrink-0 bg-amber-500" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Filter
        </span>
        <span className="text-sm font-medium text-slate-800">
          {data.label}
        </span>
      </div>

      {/* Two outputs: "pass" (left) and "reject" (right) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="pass"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="reject"
        style={{ left: "70%" }}
      />
    </div>
  );
}
