import {
  Handle,
  Position,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import { Share2 } from "lucide-react";
import React, { useCallback } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LinkNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A simple node designed to connect two separate parts of a flow.
 * Usually positioned horizontally to bridge logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type LinkNodeData = { label: string };

export type LinkNodeType = Node<
  LinkNodeData,
  "link"
>;

/**
 * LinkNode Component
 *
 * @param id - Node ID for state persistence.
 * @param data - Label data.
 */
export function LinkNode({
  id,
  data,
}: NodeProps<LinkNodeType>) {
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
    <div className="flex items-stretch min-w-[160px] bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md relative">
      {/* TARGET HANDLE: Input from the left */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-300 border border-white z-10"
      />

      {/* Blue accent bar to indicate 'Link' type visually */}
      <div className="w-1.5 shrink-0 bg-blue-300 rounded-l-xl" />

      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Share2 className="w-3 h-3 text-blue-300" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Link
          </span>
        </div>
        <input
          type="text"
          value={data.label}
          onChange={handleLabelChange}
          // Prevent React Flow from intercepting keys meant for the input
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-medium text-slate-800 bg-transparent outline-none focus:text-blue-500 transition-colors nowheel nodrag nopan"
          placeholder="Path Name..."
        />
      </div>

      {/* SOURCE HANDLE: Output to the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="link"
        className="w-2 h-2 bg-blue-300 border border-white"
      />
    </div>
  );
}
