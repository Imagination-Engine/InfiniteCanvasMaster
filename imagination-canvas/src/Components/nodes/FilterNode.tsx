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
 * Visual cues:
 *  - Amber accent bar on the left edge
 *  - TARGET handle (top) for incoming data
 *  - Two SOURCE handles (bottom-left, bottom-right) representing "pass" and "reject" branches
 */
export function FilterNode({
  data,
}: NodeProps<FilterNodeType>) {
  return (
    <div className="filter-node">
      {/* Incoming data to be evaluated */}
      <Handle
        type="target"
        position={Position.Top}
      />

      <div className="node-accent node-accent--amber" />

      <div className="node-body">
        <span className="node-type-label">
          Filter
        </span>
        <span className="node-label">
          {data.label}
        </span>
      </div>

      {/* Two outputs: "pass" branch (left) and "reject" branch (right) */}
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
