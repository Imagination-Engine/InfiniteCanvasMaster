import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpansionStore } from "../state/expansionStore";
import { useCanvasStore } from "../state/canvasStore";
import { X, Bot, Settings2, MessageSquare } from "lucide-react";
import { BlockRegistry } from "../contracts/BlockRegistry";
export const ImmersiveBlockModal = () => {
  const { activeExpansionId, activeMode, clearExpanded } = useExpansionStore();
  const objects = useCanvasStore((s) => s.objects);
  const activeObject = useMemo(() => {
    if (!activeExpansionId) return null;
    if (Array.isArray(objects)) {
      return objects.find((o) => o.id === activeExpansionId) || null;
    }
    return objects[activeExpansionId] || null;
  }, [activeExpansionId, objects]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearExpanded();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [clearExpanded]);
  const accentClass = useMemo(() => {
    if (!activeObject) return "border-b-brand-purple";
    const prefix = activeObject.type.split(".")[0];
    switch (prefix) {
      case "agent":
      case "conductor":
        return "border-b-brand-cyan shadow-[0_1px_15px_rgba(0,194,255,0.2)]";
      case "scribe":
      case "note":
        return "border-b-violet-500 shadow-[0_1px_15px_rgba(139,92,246,0.2)]";
      case "playable":
        return "border-b-orange-500 shadow-[0_1px_15px_rgba(249,115,22,0.2)]";
      case "atlas":
        return "border-b-blue-500 shadow-[0_1px_15px_rgba(59,130,246,0.2)]";
      case "reel":
      case "media":
        return "border-b-rose-500 shadow-[0_1px_15px_rgba(244,63,94,0.2)]";
      case "forge":
      case "app":
        return "border-b-emerald-500 shadow-[0_1px_15px_rgba(16,185,129,0.2)]";
      default:
        return "border-b-brand-purple shadow-[0_1px_15px_rgba(123,92,234,0.2)]";
    }
  }, [activeObject]);
  if (!activeObject || activeMode === "none") return null;
  const displayLabel =
    activeObject.metadata?.label ||
    activeObject.metadata?.title ||
    activeObject.type.split(".").pop();
  return _jsx(AnimatePresence, {
    children: _jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { type: "spring", damping: 25, stiffness: 300 },
        className:
          "absolute inset-0 z-[10002] bg-brand-bg-page border border-white/10 rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden",
        children: [
          _jsxs("div", {
            "data-testid": "modal-accent-bar",
            className: `h-16 border-b bg-black/40 flex items-center justify-between px-6 shrink-0 ${accentClass}`,
            children: [
              _jsxs("div", {
                className: "flex items-center gap-4",
                children: [
                  _jsx("div", {
                    className: `w-2 h-2 rounded-full ${activeObject.status === "error" ? "bg-red-500 animate-pulse" : activeObject.status === "running" ? "bg-brand-cyan animate-pulse shadow-[0_0_10px_rgba(0,194,255,0.6)]" : "bg-white/20"}`,
                  }),
                  _jsxs("div", {
                    className: "flex flex-col",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          _jsx("h1", {
                            className:
                              "text-sm font-black uppercase tracking-widest text-white",
                            children: displayLabel,
                          }),
                          _jsx("span", {
                            className:
                              "px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/60 uppercase tracking-widest",
                            children: activeObject.type,
                          }),
                        ],
                      }),
                      activeObject.metadata?.description &&
                        _jsx("p", {
                          className: "text-[10px] text-white/50 italic mt-0.5",
                          children: activeObject.metadata.description,
                        }),
                    ],
                  }),
                ],
              }),
              _jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  activeObject.status === "running" &&
                    _jsx("span", {
                      className:
                        "text-[10px] font-bold text-brand-cyan uppercase tracking-widest animate-pulse mr-4",
                      children: "Agent is thinking...",
                    }),
                  _jsx("button", {
                    onClick: clearExpanded,
                    className:
                      "p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all",
                    children: _jsx(X, { size: 18 }),
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex-1 flex overflow-hidden",
            children: [
              _jsxs("div", {
                className:
                  "w-80 border-r border-white/5 bg-black/20 flex flex-col",
                children: [
                  _jsxs("div", {
                    className:
                      "p-4 border-b border-white/5 flex items-center gap-2",
                    children: [
                      _jsx(MessageSquare, {
                        size: 14,
                        className: "text-brand-cyan",
                      }),
                      _jsx("span", {
                        className:
                          "text-xs font-bold uppercase tracking-widest text-white",
                        children: "Block Chat",
                      }),
                    ],
                  }),
                  _jsx("div", {
                    className: "flex-1 p-4 flex items-center justify-center",
                    children: _jsx("p", {
                      className:
                        "text-[10px] text-brand-text-muted italic text-center px-4",
                      children:
                        "Runtime boundary ready. Chat with this block\u2019s agent here. Commands sent here are routed to the block\u2019s isolated context.",
                    }),
                  }),
                  _jsx("div", {
                    className: "p-3 border-t border-white/5",
                    children: _jsx("input", {
                      type: "text",
                      placeholder: "Message agent...",
                      className:
                        "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50",
                    }),
                  }),
                ],
              }),
              _jsx("div", {
                className:
                  "flex-1 flex flex-col bg-brand-bg-surface relative overflow-hidden",
                children: _jsx("div", {
                  className: "flex-1 overflow-auto custom-scrollbar",
                  children: (() => {
                    const Component =
                      BlockRegistry.resolve(activeObject.blockKind) ||
                      BlockRegistry.resolve(activeObject.type) ||
                      null;
                    if (!Component) {
                      return _jsx("div", {
                        className:
                          "flex-1 p-8 flex items-center justify-center text-white/20",
                        children: _jsxs("div", {
                          className: "text-center",
                          children: [
                            _jsx(Bot, {
                              size: 48,
                              className: "mx-auto mb-4 opacity-50",
                            }),
                            _jsx("h2", {
                              className:
                                "text-lg font-bold tracking-widest uppercase mb-2",
                              children: "Deep Surface Runtime",
                            }),
                            _jsx("p", {
                              className:
                                "text-xs max-w-md mx-auto leading-relaxed",
                              children:
                                "This area hosts the specialized immersive view for this block.",
                            }),
                          ],
                        }),
                      });
                    }
                    return _jsx(Component, {
                      object: activeObject,
                      mode:
                        activeMode === "fullscreen"
                          ? "fullscreen"
                          : "side-panel",
                      data: {
                        input:
                          activeObject.metadata.inputs ||
                          activeObject.metadata ||
                          {},
                        output: activeObject.metadata.outputs || {},
                      },
                    });
                  })(),
                }),
              }),
              _jsxs("div", {
                className:
                  "w-64 border-l border-white/5 bg-black/20 flex flex-col",
                children: [
                  _jsxs("div", {
                    className:
                      "p-4 border-b border-white/5 flex items-center gap-2",
                    children: [
                      _jsx(Settings2, {
                        size: 14,
                        className: "text-brand-text-muted",
                      }),
                      _jsx("span", {
                        className:
                          "text-xs font-bold uppercase tracking-widest text-white",
                        children: "Controls",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "p-4 flex flex-col gap-6",
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsx("h3", {
                            className:
                              "text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-3",
                            children: "Capabilities",
                          }),
                          _jsxs("div", {
                            className: "flex flex-wrap gap-2",
                            children: [
                              (activeObject.metadata?.capabilities || []).map(
                                (cap) =>
                                  _jsx(
                                    "span",
                                    {
                                      className:
                                        "px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold uppercase tracking-tighter text-white/60",
                                      children: cap,
                                    },
                                    cap,
                                  ),
                              ),
                              !activeObject.metadata?.capabilities?.length &&
                                _jsx("span", {
                                  className: "text-[10px] text-white/30 italic",
                                  children: "None",
                                }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx("h3", {
                            className:
                              "text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-3",
                            children: "Runtime Status",
                          }),
                          _jsxs("div", {
                            className:
                              "p-3 bg-white/5 rounded-lg border border-white/10 font-mono text-[10px] text-brand-text-body",
                            children: [
                              "State: ",
                              activeObject.status,
                              _jsx("br", {}),
                              "Layer: Edge Twin",
                              _jsx("br", {}),
                              "Engine: ",
                              activeObject.metadata?.runtime || "LIVE",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      activeObject.id,
    ),
  });
};
