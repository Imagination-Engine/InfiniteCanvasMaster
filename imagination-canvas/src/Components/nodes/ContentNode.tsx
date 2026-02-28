/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ContentNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A block for rich text content (markdown, plaintext, or HTML).
 *
 * HOW THIS CONNECTS TO THE BLOCK SCHEMA:
 *
 *   1. blockTypes.ts defines ContentBlockContent → { document, format, ... }
 *   2. blockFactory.ts provides the default → { document: "", format: "markdown" }
 *   3. This component RENDERS and EDITS that data
 *   4. NODE_TYPES in index.ts maps "content" → this component
 *
 * When a user drags "Content" from the sidebar:
 *   Sidebar → drag payload "content"
 *   Canvas.tsx onDrop → createBlock("content", { position })
 *   React Flow sees type="content" → looks up NODE_TYPES["content"] → renders THIS
 *   This component receives the BlockData<"content"> as its `data` prop
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import { FileText } from "lucide-react";
import React, { useCallback } from "react";

// ─── Type Wiring ────────────────────────────────────────────────────
// Import the data shape from blockTypes.ts so TypeScript knows
// exactly what fields are available on `data.content`.

import type { BlockData } from "../../canvas/types/blockTypes";

/**
 * ContentNodeData is BlockData narrowed to the "content" block type.
 * This means data.content is guaranteed to be ContentBlockContent:
 *   { document: string, format: "markdown" | "plaintext" | "html", ... }
 */
export type ContentNodeData = BlockData<"content">;

/**
 * The full React Flow node type — used when you need to reference
 * the node in external code (e.g., a store or a utility function).
 */
export type ContentNodeType = Node<ContentNodeData, "content">;

// ─── Component ──────────────────────────────────────────────────────

/**
 * ContentNode Component
 *
 * WHY we destructure `id` and `data`:
 *   - `id` is needed to call updateNodeData() so React Flow knows which node to update
 *   - `data` is our BlockData<"content"> — the domain payload
 *
 * HOW data flows:
 *   User types in textarea → handleDocumentChange fires →
 *   updateNodeData() patches the node in React Flow's internal store →
 *   React Flow re-renders this component with the new data
 */
export function ContentNode({
  id,
  data,
  selected,
}: NodeProps<ContentNodeType>) {
  const { updateNodeData } = useReactFlow();

  // ── Title editing ─────────────────────────────────────────────
  // Updates data.metadata.title — the block's display name.
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, {
        ...data,
        metadata: {
          ...data.metadata,
          title: e.target.value,
          lastModifiedAt: new Date().toISOString(),
          version: data.metadata.version + 1,
        },
      });
    },
    [id, data, updateNodeData],
  );

  // ── Document editing ──────────────────────────────────────────
  // Updates data.content.document — the actual text content.
  // This is the field specific to ContentBlockContent.
  const handleDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, {
        ...data,
        content: {
          ...data.content,
          document: e.target.value,
        },
        metadata: {
          ...data.metadata,
          lastModifiedAt: new Date().toISOString(),
          version: data.metadata.version + 1,
        },
      });
    },
    [id, data, updateNodeData],
  );

  return (
    <div className="flex items-stretch min-w-[240px] min-h-[150px] h-full bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md relative">
      {/* NodeResizer — adds drag handles on edges and corners.
          Only visible when the node is selected. The `minWidth` and `minHeight`
          prevent the node from collapsing too small to be usable. */}
      <NodeResizer
        isVisible={selected}
        minWidth={240}
        minHeight={150}
        lineClassName="!border-blue-400 !border-none"
        handleClassName="!bg-transparent !border-none !w-5 !h-5"
      />
      {/* TARGET HANDLE: receives connections from other blocks */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-blue-500 border border-white z-10"
      />

      {/* Accent bar — blue to match the "Content" color in the sidebar */}
      <div className="w-1.5 shrink-0 bg-blue-500 rounded-l-xl" />

      <div className="px-3.5 py-2.5 flex flex-col gap-1.5 flex-1">
        {/* ── Header row: icon + type label ── */}
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Content
          </span>
          {/* Show the format badge */}
          <span className="ml-auto text-[9px] font-medium text-slate-300 uppercase">
            {data.content.format}
          </span>
        </div>

        {/* ── Title input ── */}
        <input
          type="text"
          value={data.metadata.title}
          onChange={handleTitleChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-semibold text-slate-800 bg-transparent outline-none focus:text-blue-600 transition-colors nowheel nodrag nopan"
          placeholder="Block title..."
        />

        {/* ── Document textarea ── */}
        {/* This is where the user writes their actual content.
            The nowheel/nodrag/nopan classes prevent React Flow from
            hijacking scroll and drag events inside the textarea. */}
        <textarea
          value={data.content.document}
          onChange={handleDocumentChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 outline-none resize-none flex-1 border border-slate-100 focus:border-blue-300 transition-colors nowheel nodrag nopan"
          placeholder="Start writing..."
        />

        {/* ── Status indicator (shows when an AI agent is generating) ── */}
        {data.status === "loading" && (
          <div className="flex items-center gap-1.5 text-[10px] text-blue-500">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Generating...
          </div>
        )}

        {data.status === "error" && (
          <div className="text-[10px] text-red-500 font-medium">
            Error generating content
          </div>
        )}

        {/* ── Agent attribution (if AI-generated) ── */}
        {data.agentContext && (
          <div className="text-[9px] text-slate-400 mt-0.5">
            by {data.agentContext.generatingAgent}
            {" · "}
            {Math.round(data.agentContext.confidenceScore * 100)}% confidence
          </div>
        )}
      </div>

      {/* SOURCE HANDLE: connects to downstream blocks */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-blue-500 border border-white"
      />
    </div>
  );
}
