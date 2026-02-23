import {
  Handle,
  Position,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";

// ─── Type Definition ────────────────────────────────────────────────
export type LinkNodeData = { label: string };
export type LinkNodeType = Node<
  LinkNodeData,
  "link"
>;

/**
 * LinkNode — connects two parts of the flow horizontally.
 *
 * - Blue-300 accent bar on the left edge
 * - TARGET handle (left) and SOURCE handle (right) for horizontal linking
 */
export function LinkNode({
  id,
  data,
}: NodeProps<LinkNodeType>) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className="flex items-stretch min-w-[160px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Incoming connection from the left */}
      <Handle
        type="target"
        position={Position.Left}
      />

      {/* Light blue accent bar */}
      <div className="w-1.5 shrink-0 bg-blue-300" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Link
        </span>
        <input
          type="text"
          value={data.label}
          onChange={(e) => {
            updateNodeData(id, {
              label: e.target.value,
            });
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-medium text-slate-800 nowheel nodrag nopan"
        />
      </div>

      {/* Outgoing connection to the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="link"
      />
    </div>
  );
}
