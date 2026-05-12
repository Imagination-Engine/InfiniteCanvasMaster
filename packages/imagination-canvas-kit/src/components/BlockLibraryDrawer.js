import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import { Search, Library, X } from "lucide-react";
import { blockRegistry } from "@iem/core";
import { useLibraryStore } from "../state/libraryStore";
import { useExpansionStore } from "../state/expansionStore";
import { BlockLibraryCard } from "./BlockLibraryCard";
export const BlockLibraryDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
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
  const { activeExpansionId } = useExpansionStore();
  const isExpanded = !!activeExpansionId;
  return _jsxs(React.Fragment, {
    children: [
      !isOpen &&
        !isExpanded &&
        _jsx("button", {
          className:
            "absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors group",
          onClick: () => setIsOpen(true),
          children: _jsxs("div", {
            className: "flex flex-col items-center gap-2",
            children: [
              _jsx(Library, { size: 20 }),
              _jsx("span", {
                className: "text-[10px] font-bold uppercase tracking-widest",
                style: { writingMode: "vertical-rl" },
                children: "Library",
              }),
            ],
          }),
        }),
      isOpen &&
        !isExpanded &&
        _jsxs("div", {
          className:
            "absolute left-0 top-0 bottom-0 w-[450px] bg-brand-bg-page/95 backdrop-blur-3xl border-r border-white/10 z-50 flex flex-col shadow-2xl",
          children: [
            _jsxs("div", {
              className:
                "p-4 border-b border-white/5 flex items-center justify-between shrink-0",
              children: [
                _jsxs("div", {
                  className: "flex items-center gap-2 text-brand-cyan",
                  children: [
                    _jsx(Library, { size: 18 }),
                    _jsx("h2", {
                      className: "text-xs font-black uppercase tracking-widest",
                      children: "Block Library",
                    }),
                  ],
                }),
                _jsx("button", {
                  onClick: () => setIsOpen(false),
                  className:
                    "p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors",
                  children: _jsx(X, { size: 16 }),
                }),
              ],
            }),
            _jsx("div", {
              className: "p-4 shrink-0",
              children: _jsxs("div", {
                className: "relative group",
                children: [
                  _jsx(Search, {
                    size: 14,
                    className:
                      "absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-cyan transition-colors",
                  }),
                  _jsx("input", {
                    type: "text",
                    placeholder: "Search 70+ blocks...",
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    className:
                      "w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all shadow-inner",
                  }),
                ],
              }),
            }),
            _jsxs("div", {
              className:
                "px-4 pb-4 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 hide-scrollbar mask-fade-right",
              children: [
                _jsx("button", {
                  onClick: () => setActiveCategory(null),
                  className:
                    "shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border " +
                    (activeCategory === null
                      ? "bg-brand-cyan text-black border-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.4)]"
                      : "bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10"),
                  children: "All",
                }),
                categories.map((cat) =>
                  _jsx(
                    "button",
                    {
                      onClick: () => setActiveCategory(cat),
                      className:
                        "shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border " +
                        (activeCategory === cat
                          ? "bg-brand-cyan text-black border-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.4)]"
                          : "bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10"),
                      children: cat,
                    },
                    cat,
                  ),
                ),
              ],
            }),
            _jsxs("div", {
              className:
                "flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4",
              children: [
                filteredBlocks.map((block) =>
                  _jsx(BlockLibraryCard, { block: block }, block.id),
                ),
                filteredBlocks.length === 0 &&
                  _jsxs("div", {
                    className:
                      "flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20",
                    children: [
                      _jsx(Search, { size: 48, className: "mb-4" }),
                      _jsx("p", {
                        className:
                          "text-xs uppercase font-black tracking-widest",
                        children: "No matching tools found",
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
    ],
  });
};
