/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ImageNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A block for displaying and managing images.
 * Supports:
 *  1. Local file upload (converts to data URL for immediate preview)
 *  2. AI Generation placeholder (prompt → endpoint)
 *  3. Resizing with NodeResizer
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
import { Image as ImageIcon, Upload, Sparkles, Trash2 } from "lucide-react";
import React, { useCallback, useRef } from "react";
import type { BlockData } from "../../canvas/types/blockTypes";

export type ImageNodeData = BlockData<"image">;
export type ImageNodeType = Node<ImageNodeData, "image">;

export function ImageNode({
  id,
  data,
  selected,
}: NodeProps<ImageNodeType>) {
  const { updateNodeData } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File Upload Logic ───────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        updateNodeData(id, {
          ...data,
          content: {
            ...data.content,
            imageUrl: reader.result as string,
            format: (file.type.split("/")[1] as "png" | "jpg" | "webp" | "svg") || "png",
          },
          metadata: {
            ...data.metadata,
            lastModifiedAt: new Date().toISOString(),
            version: data.metadata.version + 1,
          },
        });
      };
      reader.readAsDataURL(file);
    },
    [id, data, updateNodeData],
  );

  const triggerUpload = () => fileInputRef.current?.click();

  // ── Prompt Logic ───────────────────────────────────────────────
  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, {
        ...data,
        content: {
          ...data.content,
          sourcePrompt: e.target.value,
        },
      });
    },
    [id, data, updateNodeData],
  );

  // ── Title Logic ────────────────────────────────────────────────
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, {
        ...data,
        metadata: {
          ...data.metadata,
          title: e.target.value,
        },
      });
    },
    [id, data, updateNodeData],
  );
  
  // ── Remove Image Logic ──────────────────────────────────────────
  const handleRemoveImage = useCallback(() => {
    updateNodeData(id, {
      ...data,
      content: {
        ...data.content,
        imageUrl: "", // Clear the image
      },
      metadata: {
        ...data.metadata,
        lastModifiedAt: new Date().toISOString(),
        version: data.metadata.version + 1,
      },
    });
  }, [id, data, updateNodeData]);

  const hasImage = !!data.content.imageUrl;

  return (
    <div className="flex flex-col min-w-[280px] min-h-[200px] h-full bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md relative">
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={200}
        lineClassName="!border-violet-400 !border-none"
        handleClassName="!bg-transparent !border-none !w-5 !h-5"
      />

      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-violet-500 border border-white z-10"
      />

      {/* Header */}
      <div className="px-3.5 py-2 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5 font-mono">
          <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Image
          </span>
        </div>
        {hasImage && (
          <div className="flex items-center gap-1">
            <button 
              onClick={triggerUpload}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title="Replace Image"
            >
              <Upload className="w-3 h-3 text-slate-400" />
            </button>
            <button 
              onClick={handleRemoveImage}
              className="p-1 hover:bg-red-50 rounded transition-colors group/trash"
              title="Remove Image"
            >
              <Trash2 className="w-3 h-3 text-slate-400 group-hover/trash:text-red-500" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* Title Input */}
        <input
          type="text"
          value={data.metadata.title}
          onChange={handleTitleChange}
          placeholder="Image Title..."
          className="text-sm font-semibold text-slate-800 outline-none w-full bg-transparent nodrag nopan"
        />

        {/* Main Content Area */}
        <div className="flex-1 relative rounded-lg border-2 border-dashed border-slate-100 bg-slate-50/30 overflow-hidden flex flex-col items-center justify-center group">
          {hasImage ? (
            <img 
              src={data.content.imageUrl} 
              alt={data.content.altText || "Uploaded content"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 px-4 w-full">
              {/* Upload Button */}
              <button 
                onClick={triggerUpload}
                className="flex flex-col items-center gap-2 text-slate-400 hover:text-violet-500 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Click to upload image</span>
              </button>

              <div className="w-full flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-slate-100" />
                <span className="text-[9px] uppercase font-bold text-slate-300">or</span>
                <div className="h-[1px] flex-1 bg-slate-100" />
              </div>

              {/* AI Prompt Area */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-violet-500">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase">Generate with AI</span>
                </div>
                <textarea
                  value={data.content.sourcePrompt || ""}
                  onChange={handlePromptChange}
                  placeholder="Describe the image..."
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-100 outline-none focus:border-violet-300 transition-colors resize-none nowheel nodrag nopan"
                  rows={2}
                />
                <button 
                  disabled
                  className="w-full py-1.5 bg-violet-500/10 text-violet-500 text-[10px] font-bold rounded-lg border border-violet-100 opacity-50 cursor-not-allowed"
                >
                  Generate (Soon)
                </button>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {hasImage && data.status === "loading" && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
          <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-violet-500 border border-white"
      />
    </div>
  );
}