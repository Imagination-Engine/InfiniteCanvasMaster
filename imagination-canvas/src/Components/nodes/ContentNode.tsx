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
    <div className={`flex items-stretch min-w-[240px] min-h-[150px] h-full bg-brand-bg-glass backdrop-blur-3xl rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
      selected ? "border-brand-purple shadow-[0_0_30px_rgba(123,92,234,0.15)] scale-[1.01]" : "border-brand-border shadow-2xl"
    }`}>
      <NodeResizer
        isVisible={selected}
        minWidth={240}
        minHeight={150}
        lineClassName="!border-brand-purple/50 !border-none"
        handleClassName="!bg-transparent !border-none !w-5 !h-5"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-brand-purple border border-white/20 z-10"
      />

      {/* Brand Accent Bar */}
      <div className="w-1 shrink-0 bg-brand-purple/30" />

      <div className="px-4 py-3 flex flex-col gap-2 flex-1">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-brand-purple" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
            Content
          </span>
          <span className="ml-auto text-[9px] font-bold text-white/20 uppercase tracking-widest">
            {data.content.format}
          </span>
        </div>

        {/* Title input */}
        <input
          type="text"
          value={data.metadata.title}
          onChange={handleTitleChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-sm font-black text-white bg-transparent outline-none focus:text-brand-purple transition-colors nowheel nodrag nopan uppercase tracking-tight"
          placeholder="Block title..."
        />

        {/* Document textarea */}
        <textarea
          value={data.content.document}
          onChange={handleDocumentChange}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-xs text-brand-text-body bg-white/[0.02] rounded-xl p-3 outline-none resize-none flex-1 border border-brand-border focus:border-brand-purple/30 focus:bg-white/[0.04] transition-all nowheel nodrag nopan leading-relaxed"
          placeholder="Start writing..."
        />

        {/* Status indicators */}
        <div className="flex items-center justify-between mt-1">
          {data.status === "loading" ? (
            <div className="flex items-center gap-2 text-[10px] text-brand-purple font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-pulse shadow-[0_0_8px_rgba(123,92,234,0.5)]" />
              Generating
            </div>
          ) : data.status === "error" ? (
            <div className="text-[10px] text-rose-500 font-black uppercase tracking-widest">
              Error
            </div>
          ) : (
            <div />
          )}

          {data.agentContext && (
            <div className="text-[9px] text-brand-text-muted font-bold uppercase tracking-widest">
              {data.agentContext.generatingAgent} • {Math.round(data.agentContext.confidenceScore * 100)}%
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-brand-purple border border-white/20"
      />
    </div>
  );
}
