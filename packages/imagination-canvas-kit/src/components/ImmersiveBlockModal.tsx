import React, { useMemo } from "react";
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
        className="fixed inset-4 z-[9999] bg-brand-bg-page border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="h-14 border-b border-white/5 bg-black/40 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full ${activeObject.status === "error" ? "bg-red-500 animate-pulse" : activeObject.status === "running" ? "bg-brand-cyan animate-pulse shadow-[0_0_10px_rgba(0,194,255,0.6)]" : "bg-white/20"}`}
            />
            <h1 className="text-sm font-black uppercase tracking-widest text-white">
              {displayLabel}
            </h1>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/60 uppercase tracking-widest">
              {activeObject.type}
            </span>
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
                Chat with this block’s agent here. Commands sent here are routed
                to the block’s isolated context.
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
            {/* We polyfill the renderer props just like the compact view, but the component can detect it is in fullscreen if we passed mode, for now it just gets more space */}
            <div className="flex-1 p-8 overflow-auto custom-scrollbar flex items-center justify-center text-white/20">
              <div className="text-center">
                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-lg font-bold tracking-widest uppercase mb-2">
                  Deep Surface Runtime
                </h2>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  This area hosts the specialized immersive view for this block.
                  For an App Creation Studio, this is the IDE. For a Reel
                  Studio, this is the timeline. For an ImagiClaw agent, this is
                  the sandbox and tool observation deck.
                </p>
              </div>
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
                  <span className="px-2 py-1 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded text-[9px] font-bold uppercase tracking-tighter">
                    Tools
                  </span>
                  <span className="px-2 py-1 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded text-[9px] font-bold uppercase tracking-tighter">
                    Memory
                  </span>
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
                  Uptime: 00:00:00
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
