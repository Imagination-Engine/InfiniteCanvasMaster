import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { GripHorizontal, ArrowRight } from "lucide-react";
export const getRuntimeBadgeColor = (runtime) => {
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
export const BlockLibraryCard = ({ block }) => {
  const IconComponent = block.icon ? Icons[block.icon] : Icons.Box;
  return _jsxs("div", {
    draggable: true,
    onDragStart: (e) => {
      e.dataTransfer.setData("application/reactflow", block.id);
      e.dataTransfer.setData("text/plain", block.id);
      e.dataTransfer.effectAllowed = "copy";
    },
    className:
      "group relative p-3 bg-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:bg-white/[0.08] border border-white/5 hover:border-brand-cyan/30 rounded-2xl transition-all cursor-grab active:cursor-grabbing flex flex-col gap-3",
    children: [
      _jsxs("div", {
        className: "flex justify-between items-start",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              _jsx("div", {
                className:
                  "p-2.5 bg-black/40 border border-white/10 rounded-xl text-brand-cyan group-hover:border-brand-cyan/50 group-hover:shadow-[0_0_15px_rgba(0,194,255,0.3)] transition-all",
                children: IconComponent && _jsx(IconComponent, { size: 16 }),
              }),
              _jsxs("div", {
                className: "flex flex-col",
                children: [
                  _jsx("h3", {
                    className: "text-xs font-bold text-white tracking-wide",
                    children: block.name,
                  }),
                  _jsxs("div", {
                    className: "flex items-center gap-1.5 mt-0.5",
                    children: [
                      _jsx("span", {
                        className:
                          "text-[8px] font-black uppercase tracking-tighter text-white/40",
                        children: block.category,
                      }),
                      block.studio &&
                        _jsx("span", {
                          className:
                            "text-[8px] px-1.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-brand-cyan font-bold uppercase tracking-tighter scale-90 origin-left",
                          children: block.studio,
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          block.agentic &&
            _jsx("div", {
              className:
                "px-2 py-0.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded text-[9px] font-black uppercase tracking-widest",
              children: "Agentic",
            }),
        ],
      }),
      _jsx("p", {
        className:
          "text-[11px] text-brand-text-muted leading-relaxed line-clamp-3",
        children: block.description,
      }),
      block.capabilities &&
        block.capabilities.length > 0 &&
        _jsx("div", {
          className: "flex flex-wrap gap-1.5",
          children: block.capabilities
            .slice(0, 3)
            .map((cap) =>
              _jsx(
                "span",
                {
                  className:
                    "px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[8px] font-bold text-white/50 lowercase",
                  children: cap,
                },
                cap,
              ),
            ),
        }),
      (block.accepts?.length > 0 || block.produces?.length > 0) &&
        _jsx(motion.div, {
          initial: { height: 0, opacity: 0, marginTop: 0 },
          whileHover: { height: "auto", opacity: 1, marginTop: 4 },
          className: "overflow-hidden",
          "data-testid": "io-row",
          children: _jsxs("div", {
            className: "flex items-center gap-2 pt-2 border-t border-white/5",
            children: [
              block.accepts?.length > 0 &&
                _jsx("span", {
                  className:
                    "px-1.5 py-0.5 bg-brand-bg-surface border border-white/10 rounded text-[8px] font-bold text-white/60 lowercase",
                  children: block.accepts.join(", "),
                }),
              _jsx(ArrowRight, { size: 10, className: "text-brand-cyan/50" }),
              block.produces?.length > 0 &&
                _jsx("span", {
                  className:
                    "px-1.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-[8px] font-bold text-brand-cyan lowercase",
                  children: block.produces.join(", "),
                }),
            ],
          }),
        }),
      _jsxs("div", {
        className:
          "flex items-center justify-between mt-1 pt-2 border-t border-white/5",
        children: [
          _jsx("div", {
            className: "flex items-center",
            children: _jsx("div", {
              "data-testid": "runtime-badge",
              className: `px-1.5 py-0.5 border rounded text-[8px] font-bold uppercase tracking-widest ${getRuntimeBadgeColor(block.runtime)}`,
              children: block.runtime || "Static",
            }),
          }),
          _jsxs("div", {
            className:
              "opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white/20",
            children: [
              _jsx("span", {
                className: "text-[7px] font-black uppercase tracking-tighter",
                children: "Drag",
              }),
              _jsx(GripHorizontal, { size: 12 }),
            ],
          }),
        ],
      }),
    ],
  });
};
