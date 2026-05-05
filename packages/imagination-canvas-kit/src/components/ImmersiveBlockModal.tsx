// @ts-nocheck
import React, { useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpansionStore } from "../state/expansionStore";
import { useCanvasStore } from "../state/canvasStore";
import { X, Bot, Settings2, Activity, MessageSquare } from "lucide-react";
import { BlockRegistry } from "../contracts/BlockRegistry";

export const ImmersiveBlockModal: React.FC = () => {
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
    const handleKeyDown = (e: KeyboardEvent) => {
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        key={activeObject.id}
        className="absolute inset-0 z-[10002] bg-brand-bg-page border border-white/10 rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div
          data-testid="modal-accent-bar"
          className={`h-16 border-b bg-black/40 flex items-center justify-between px-6 shrink-0 ${accentClass}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full ${activeObject.status === "error" ? "bg-red-500 animate-pulse" : activeObject.status === "running" ? "bg-brand-cyan animate-pulse shadow-[0_0_10px_rgba(0,194,255,0.6)]" : "bg-white/20"}`}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-sm font-black uppercase tracking-widest text-white">
                  {displayLabel}
                </h1>
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/60 uppercase tracking-widest">
                  {activeObject.type}
                </span>
              </div>
              {activeObject.metadata?.description && (
                <p className="text-[10px] text-white/50 italic mt-0.5">
                  {activeObject.metadata.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeObject.status === "running" && (
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest animate-pulse mr-4">
                Agent is thinking...
              </span>
            )}
            <button
              onClick={clearExpanded}
              className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body - Split Pane Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* ... (previous panes remain as they are for layout) ... */}
          {/* Left Sidebar - Chat / Orchestration */}
          <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <MessageSquare size={14} className="text-brand-cyan" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                Block Chat
              </span>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center">
              <p className="text-[10px] text-brand-text-muted italic text-center px-4">
                Runtime boundary ready. Chat with this block’s agent here.
                Commands sent here are routed to the block’s isolated context.
              </p>
            </div>
            <div className="p-3 border-t border-white/5">
              <input
                type="text"
                placeholder="Message agent..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50"
              />
            </div>
          </div>

          {/* Center - Deep Surface (Component Rendering) */}
          <div className="flex-1 flex flex-col bg-brand-bg-surface relative overflow-hidden">
            <div className="flex-1 overflow-auto custom-scrollbar">
              {(() => {
                const Component =
                  BlockRegistry.resolve((activeObject as any).blockKind) ||
                  BlockRegistry.resolve(activeObject.type) ||
                  null;

                if (!Component) {
                  return (
                    <div className="flex-1 p-8 flex items-center justify-center text-white/20">
                      <div className="text-center">
                        <Bot size={48} className="mx-auto mb-4 opacity-50" />
                        <h2 className="text-lg font-bold tracking-widest uppercase mb-2">
                          Deep Surface Runtime
                        </h2>
                        <p className="text-xs max-w-md mx-auto leading-relaxed">
                          This area hosts the specialized immersive view for
                          this block.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Component
                    object={activeObject}
                    mode={
                      activeMode === "fullscreen" ? "fullscreen" : "side-panel"
                    }
                    data={{
                      input:
                        activeObject.metadata.inputs ||
                        activeObject.metadata ||
                        {},
                      output: activeObject.metadata.outputs || {},
                    }}
                  />
                );
              })()}
            </div>
          </div>

          {/* Right Sidebar - Controls & Status */}
          <div className="w-64 border-l border-white/5 bg-black/20 flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <Settings2 size={14} className="text-brand-text-muted" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                Controls
              </span>
            </div>

            <div className="p-4 flex flex-col gap-6">
              <div>
                <h3 className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-3">
                  Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    (activeObject.metadata?.capabilities as string[]) || []
                  ).map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold uppercase tracking-tighter text-white/60"
                    >
                      {cap}
                    </span>
                  ))}
                  {!activeObject.metadata?.capabilities?.length && (
                    <span className="text-[10px] text-white/30 italic">
                      None
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-3">
                  Runtime Status
                </h3>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 font-mono text-[10px] text-brand-text-body">
                  State: {activeObject.status}
                  <br />
                  Layer: Edge Twin
                  <br />
                  Engine: {activeObject.metadata?.runtime || "LIVE"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
