// @ts-nocheck
import React, { useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpansionStore } from "../state/expansionStore";
import { useCanvasStore } from "../state/canvasStore";
import {
  X,
  Bot,
  Settings2,
  Activity,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { AgnosticRenderShell } from "./AgnosticRenderShell";
import { BlockInspector } from "./BlockInspector";

export interface ImmersiveBlockModalProps {
  /**
   * Specialized Chat component injected from the app layer to maintain package boundaries.
   * Expected to accept projectId and blockId props.
   */
  ChatComponent?: React.ComponentType<{
    projectId: string;
    blockId: string;
    fullScreen?: boolean;
  }>;
}

export const ImmersiveBlockModal: React.FC<ImmersiveBlockModalProps> = ({
  ChatComponent,
}) => {
  const { activeExpansionId, activeProjectId, activeMode, clearExpanded } =
    useExpansionStore();
  const objects = useCanvasStore((s) => s.objects);
  const [activeTab, setActiveTab] = React.useState<"chat" | "config">("chat");

  const activeObject = useMemo(() => {
    if (!activeExpansionId) return null;
    return objects[activeExpansionId] || null;
  }, [activeExpansionId, objects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearExpanded();
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
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className="fixed inset-0 z-[10001] bg-black/60 flex items-center justify-center p-4 md:p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          key={activeObject.id}
          className="w-full h-full bg-brand-bg-page border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative"
        >
          {/* Modal Header */}
          <div
            data-testid="modal-accent-bar"
            className={`h-16 border-b bg-black/40 flex items-center justify-between px-6 shrink-0 relative z-[100] ${accentClass}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-2.5 h-2.5 rounded-full ${activeObject.status === "error" ? "bg-red-500 animate-pulse" : activeObject.status === "running" ? "bg-brand-cyan animate-pulse shadow-[0_0_10px_rgba(0,194,255,0.6)]" : "bg-white/20"}`}
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

            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "chat" ? "bg-brand-cyan text-black shadow-lg" : "text-white/40 hover:text-white"}`}
                >
                  <MessageSquare size={12} />
                  Agent
                </button>
                <button
                  onClick={() => setActiveTab("config")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "config" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}
                >
                  <Settings2 size={12} />
                  Config
                </button>
              </div>

              <div className="w-px h-6 bg-white/10 mx-2" />

              <button
                onClick={clearExpanded}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body - 40/60 Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Utility Sidebar (40%) */}
            <div className="w-[40%] min-w-[450px] border-r border-white/10 bg-black/20 flex flex-col relative z-[10]">
              <AnimatePresence mode="wait">
                {activeTab === "chat" ? (
                  <motion.div
                    key="chat-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {ChatComponent ? (
                      <ChatComponent
                        projectId={activeProjectId || "default"}
                        blockId={activeObject.id}
                        fullScreen={true}
                      />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <Sparkles
                          size={40}
                          className="text-brand-cyan opacity-20"
                        />
                        <p className="text-xs text-white/40 leading-relaxed italic">
                          Connect your agent to this block to enable sovereign
                          orchestration.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="config-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 overflow-hidden"
                  >
                    <BlockInspector object={activeObject} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Universal Surface (70%) */}
            <div className="flex-1 bg-brand-bg-surface relative overflow-hidden">
              <AgnosticRenderShell object={activeObject} mode="fullscreen" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
