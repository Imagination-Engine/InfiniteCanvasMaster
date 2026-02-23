import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";

// ─── Type Definition ────────────────────────────────────────────────
// Each custom node carries a `label` string in its data payload.
// This type is exported so the Canvas can use it when creating nodes.
export type TriggerNodeData = { label: string };
export type TriggerNodeType = Node<
  TriggerNodeData,
  "trigger"
>;

/**
 * TriggerNode — the entry-point node for any flow.
 *
 * Visual cues:
 *  - Emerald accent bar on the left edge
 *  - Only a SOURCE handle (bottom) because triggers start flows, they don't receive input
 */
export function TriggerNode({
  data,
}: NodeProps<TriggerNodeType>) {
  return (
    <div className="trigger-node">
      {/* Colored accent bar — matches the emerald color from MODULE_TYPES */}
      <div className="node-accent node-accent--emerald" />

      <div className="node-body">
        <span className="node-type-label">
          Trigger
        </span>
        <span className="node-label">
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
