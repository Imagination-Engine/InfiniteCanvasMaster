// @ts-nocheck
import React from "react";
import * as Icons from "lucide-react";
import { GripHorizontal } from "lucide-react";
import type { BlockDefinition } from "@iem/core";

interface BlockLibraryCardProps {
  block: BlockDefinition<any, any>;
}

export const BlockLibraryCard: React.FC<BlockLibraryCardProps> = ({
  block,
}) => {
  const IconComponent = block.icon ? (Icons as any)[block.icon] : Icons.Box;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/reactflow", block.id);
        e.dataTransfer.setData("text/plain", block.id);
        e.dataTransfer.effectAllowed = "copy";
      }}
      className="group relative p-3 bg-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:bg-white/[0.08] border border-white/5 hover:border-brand-cyan/30 rounded-2xl transition-all cursor-grab active:cursor-grabbing flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-brand-cyan group-hover:border-brand-cyan/50 group-hover:shadow-[0_0_15px_rgba(0,194,255,0.3)] transition-all">
            {IconComponent && <IconComponent size={16} />}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-white tracking-wide">
              {block.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-black uppercase tracking-tighter text-white/40">
                {block.category}
              </span>
              {block.studio && (
                <span className="text-[8px] px-1.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-brand-cyan font-bold uppercase tracking-tighter scale-90 origin-left">
                  {block.studio}
                </span>
              )}
            </div>
          </div>
        </div>
        {block.agentic && (
          <div className="px-1.5 py-0.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded text-[7px] font-black uppercase tracking-widest">
            Agentic
          </div>
        )}
      </div>

      {/* Body */}
      <p className="text-[10px] text-brand-text-muted leading-relaxed line-clamp-2">
        {block.description}
      </p>

      {/* Capability Chips */}
      {block.capabilities && block.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {block.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[8px] font-bold text-white/50 lowercase"
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1 h-1 rounded-full ${block.runtime === "none" ? "bg-white/20" : "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"}`}
          />
          <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
            Runtime: {block.runtime || "Static"}
          </span>
        </div>

        {/* Hover-only drag handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white/20">
          <span className="text-[7px] font-black uppercase tracking-tighter">
            Drag
          </span>
          <GripHorizontal size={12} />
        </div>
      </div>
    </div>
  );
};
