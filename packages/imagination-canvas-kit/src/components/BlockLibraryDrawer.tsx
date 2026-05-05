// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import { Search, Library, X } from "lucide-react";
import { blockRegistry } from "@iem/core";
import * as Icons from "lucide-react";
import { useLibraryStore } from "../state/libraryStore";

export const BlockLibraryDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { loadCustomBlocks } = useLibraryStore();

  useEffect(() => {
    if (isOpen) {
      loadCustomBlocks();
    }
  }, [isOpen, loadCustomBlocks]);

  const blocks = useMemo(() => blockRegistry.list(), [isOpen]);

  const categories = useMemo(() => {
    const cats = new Set(blocks.map((b) => b.category));
    return Array.from(cats);
  }, [blocks]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const matchesSearch =
        search === "" ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === null || b.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blocks, search, activeCategory]);

  return (
    <React.Fragment>
      {!isOpen && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors group"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex flex-col items-center gap-2">
            <Library size={20} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ writingMode: "vertical-rl" }}
            >
              Library
            </span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="absolute left-0 top-0 bottom-0 w-[450px] bg-brand-bg-page/95 backdrop-blur-3xl border-r border-white/10 z-50 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-brand-cyan">
              <Library size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">
                Block Library
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 shrink-0">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search 70+ blocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
              />
            </div>
          </div>

          <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 hide-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={
                "shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all " +
                (activeCategory === null
                  ? "bg-brand-cyan text-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10")
              }
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  "shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all " +
                  (activeCategory === cat
                    ? "bg-brand-cyan text-black"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10")
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
            {filteredBlocks.map((block) => {
              const IconComponent = block.icon
                ? (Icons as any)[block.icon]
                : Icons.Box;
              return (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/reactflow", block.id);
                    e.dataTransfer.setData("text/plain", block.id);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="group relative p-3 bg-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:bg-white/[0.04] border border-white/5 hover:border-brand-cyan/30 rounded-xl transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-black/40 border border-white/10 rounded-xl text-brand-cyan group-hover:border-brand-cyan/50 group-hover:shadow-[0_0_15px_rgba(0,194,255,0.3)] transition-all">
                        {IconComponent && <IconComponent size={14} />}
                      </div>
                      <h3 className="text-xs font-bold text-white tracking-wide">
                        {block.name}
                      </h3>
                    </div>
                    {block.agentic && (
                      <div className="px-1.5 py-0.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded text-[8px] font-black uppercase tracking-widest">
                        Agentic
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-brand-text-muted leading-relaxed">
                    {block.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-white/60 font-bold uppercase tracking-tighter">
                      {block.category}
                    </span>
                    {block.studio && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-brand-cyan font-bold uppercase tracking-tighter">
                        {block.studio}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
