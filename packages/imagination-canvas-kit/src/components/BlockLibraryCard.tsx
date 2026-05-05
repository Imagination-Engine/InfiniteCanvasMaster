// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { GripHorizontal, ArrowRight } from "lucide-react";
import type { BlockDefinition } from "@iem/core";

interface BlockLibraryCardProps {
  block: BlockDefinition<any, any>;
}

export const getRuntimeBadgeColor = (runtime?: string) => {
  switch (runtime?.toLowerCase()) {
    case "agent":
      return "bg-brand-purple/20 text-brand-purple border-brand-purple/30";
    case "studio":
      return "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30";
    case "sandbox":
      return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    case "generator":
      return "bg-rose-500/20 text-rose-500 border-rose-500/30";
    case "none":
    case "static":
      return "bg-white/5 text-white/40 border-white/10";
    default:
      return "bg-white/10 text-white/50 border-white/20";
  }
};

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
          <div className="px-2 py-0.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded text-[9px] font-black uppercase tracking-widest">
            Agentic
          </div>
        )}
      </div>

      {/* Body */}
      <p className="text-[11px] text-brand-text-muted leading-relaxed line-clamp-3">
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

      {/* I/O Row (Revealed on hover) */}
      {(block.accepts?.length > 0 || block.produces?.length > 0) && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          whileHover={{ height: "auto", opacity: 1, marginTop: 4 }}
          className="overflow-hidden"
          data-testid="io-row"
        >
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            {block.accepts?.length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand-bg-surface border border-white/10 rounded text-[8px] font-bold text-white/60 lowercase">
                {block.accepts.join(", ")}
              </span>
            )}
            <ArrowRight size={10} className="text-brand-cyan/50" />
            {block.produces?.length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-[8px] font-bold text-brand-cyan lowercase">
                {block.produces.join(", ")}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
        <div className="flex items-center">
          <div
            data-testid="runtime-badge"
            className={`px-1.5 py-0.5 border rounded text-[8px] font-bold uppercase tracking-widest ${getRuntimeBadgeColor(block.runtime)}`}
          >
            {block.runtime || "Static"}
          </div>
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
