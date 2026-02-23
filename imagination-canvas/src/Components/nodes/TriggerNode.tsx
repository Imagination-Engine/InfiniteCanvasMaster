import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";

// ─── Type Definition ────────────────────────────────────────────────
export type TriggerNodeData = { label: string };
export type TriggerNodeType = Node<
  TriggerNodeData,
  "trigger"
>;

/**
 * TriggerNode — the entry-point node for any flow.
 *
 * - Emerald accent bar on the left edge
 * - Only a SOURCE handle (bottom) — triggers start flows, they don't receive input
 */
export function TriggerNode({
  data,
}: NodeProps<TriggerNodeType>) {
  return (
    <div className="flex items-stretch min-w-[160px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Emerald accent bar */}
      <div className="w-1.5 shrink-0 bg-emerald-500" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Trigger
        </span>
        <span className="text-sm font-medium text-slate-800">
          {data.label}
        </span>
      </div>

      {/* Source-only: triggers fire events downstream */}
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}
