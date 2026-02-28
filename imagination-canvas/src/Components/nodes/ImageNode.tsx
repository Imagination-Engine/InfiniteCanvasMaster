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
    <div className={`flex flex-col min-w-[280px] min-h-[220px] h-full bg-white/[0.03] backdrop-blur-3xl rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
      selected ? "border-[#00C2FF] shadow-[0_0_30px_rgba(0,194,255,0.15)] scale-[1.01]" : "border-white/5 shadow-2xl"
    }`}>
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={220}
        lineClassName="!border-[#00C2FF]/50 !border-none"
        handleClassName="!bg-transparent !border-none !w-5 !h-5"
      />

      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-[#00C2FF] border border-white/20 z-10"
      />

      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-[#00C2FF]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7A99]">
            Image
          </span>
        </div>
        {hasImage && (
          <div className="flex items-center gap-1.5">
            <button 
              onClick={triggerUpload}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              title="Replace"
            >
              <Upload className="w-3 h-3 text-[#6B7A99] hover:text-[#00C2FF]" />
            </button>
            <button 
              onClick={handleRemoveImage}
              className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors group/trash"
              title="Remove"
            >
              <Trash2 className="w-3 h-3 text-[#6B7A99] group-hover/trash:text-rose-500" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        <input
          type="text"
          value={data.metadata.title}
          onChange={handleTitleChange}
          placeholder="Image Title..."
          className="text-sm font-black text-white outline-none w-full bg-transparent nodrag nopan uppercase tracking-tight"
        />

        <div className="flex-1 relative rounded-xl border border-dashed border-white/10 bg-white/[0.01] overflow-hidden flex flex-col items-center justify-center group/preview">
          {hasImage ? (
            <img 
              src={data.content.imageUrl} 
              alt={data.content.altText || "Uploaded content"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-5 py-8 px-4 w-full text-center">
              {/* Upload Button */}
              <button 
                onClick={triggerUpload}
                className="flex flex-col items-center gap-3 text-[#6B7A99] hover:text-[#00C2FF] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] shadow-lg flex items-center justify-center border border-white/5 group-hover/preview:scale-110 group-hover/preview:border-[#00C2FF]/30 transition-all duration-500">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Content</span>
              </button>

              <div className="w-full flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[9px] uppercase font-black text-white/10 tracking-widest">or</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              {/* AI Prompt Area */}
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#00C2FF]">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Manifest with AI</span>
                </div>
                <textarea
                  value={data.content.sourcePrompt || ""}
                  onChange={handlePromptChange}
                  placeholder="Describe your imagination..."
                  className="w-full text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5 outline-none focus:border-[#00C2FF]/30 transition-all resize-none nowheel nodrag nopan text-[#B0B8CC] leading-relaxed"
                  rows={2}
                />
                <button 
                  disabled
                  className="w-full py-2 bg-[#00C2FF]/10 text-[#00C2FF] text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-[#00C2FF]/20 opacity-40 cursor-not-allowed"
                >
                  Generate
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20">
          <Sparkles className="w-8 h-8 text-[#00C2FF] animate-pulse" />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-[#00C2FF] border border-white/20"
      />
    </div>
  );
}