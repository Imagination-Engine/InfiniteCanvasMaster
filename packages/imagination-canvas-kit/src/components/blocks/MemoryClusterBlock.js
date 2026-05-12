import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { Brain, Layers } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";
export const MemoryClusterBlock = ({ object }) => {
  const zoom = useViewportStore((s) => s.zoom);
  const summary = object.metadata?.summary || "Empty Memory Cluster";
  const itemsCount = object.metadata?.itemsCount || 0;
  const isFarOut = zoom < 0.4;
  return _jsxs("div", {
    className:
      "p-4 bg-brand-bg-surface border border-brand-purple/20 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl overflow-hidden",
    style: { width: object.width, height: object.height },
    children: [
      _jsxs("div", {
        className: "flex items-center gap-2 mb-1",
        children: [
          _jsx("div", {
            className: "p-1.5 bg-brand-purple/20 rounded-lg text-brand-purple",
            children: _jsx(Brain, { size: 16 }),
          }),
          _jsx("div", {
            className: "text-xs font-bold uppercase tracking-widest",
            children: "Memory Cluster",
          }),
        ],
      }),
      _jsx("div", {
        className:
          "flex-1 flex flex-col justify-center items-center gap-4 text-center",
        children: !isFarOut
          ? _jsxs(_Fragment, {
              children: [
                _jsx("div", {
                  className:
                    "text-[12px] font-medium leading-relaxed text-brand-text-body px-2",
                  children: summary,
                }),
                _jsxs("div", {
                  className:
                    "flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full",
                  children: [
                    _jsx(Layers, { size: 10, className: "text-brand-purple" }),
                    _jsxs("span", {
                      className:
                        "text-[10px] font-black uppercase text-brand-purple tracking-widest",
                      children: [itemsCount, " Items"],
                    }),
                  ],
                }),
              ],
            })
          : _jsxs("div", {
              className: "relative w-16 h-16 flex items-center justify-center",
              children: [
                _jsx("div", {
                  className:
                    "absolute inset-0 bg-brand-purple/20 rounded-full animate-ping opacity-20",
                }),
                _jsx(Brain, {
                  size: 24,
                  className: "text-brand-purple opacity-40",
                }),
              ],
            }),
      }),
      _jsxs("div", {
        className:
          "mt-auto pt-2 border-t border-white/5 flex justify-between items-center",
        children: [
          _jsx("div", {
            className:
              "text-[9px] text-brand-text-muted uppercase tracking-tighter",
            children: "Knowledge Base",
          }),
          _jsx("div", {
            className: "text-[9px] text-brand-text-muted",
            children: "v1.0",
          }),
        ],
      }),
    ],
  });
};
