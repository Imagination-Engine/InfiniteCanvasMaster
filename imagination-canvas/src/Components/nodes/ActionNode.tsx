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
 * Visual cues:
 *  - Blue accent bar on the left edge
 *  - Both TARGET (top) and SOURCE (bottom) handles — actions receive input and pass output
 */
export function ActionNode({
  data,
}: NodeProps<ActionNodeType>) {
  return (
    <div className="action-node">
      {/* Receives input from upstream nodes */}
      <Handle
        type="target"
        position={Position.Top}
      />

      <div className="node-accent node-accent--blue" />

      <div className="node-body">
        <span className="node-type-label">
          Action
        </span>
        <span className="node-label">
          {data.label}
        </span>
      </div>

      {/* Passes output to downstream nodes */}
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}
