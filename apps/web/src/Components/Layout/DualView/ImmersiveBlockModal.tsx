// @ts-nocheck
import React from "react";
import { useExpansionStore, useCanvasStore } from "@iem/imagination-canvas-kit";
import { X, ExternalLink, Settings, Sparkles, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { viewRegistry } from "../../../block/ViewRegistry";

export const ImmersiveBlockModal: React.FC = () => {
  const { activeId, mode, setExpansion } = useExpansionStore();
  const object = useCanvasStore((s) => (activeId ? s.objects[activeId] : null));
  const updateObject = useCanvasStore((s) => s.updateObject);

  if (mode !== "modal" || !object) return null;

  const label = object.metadata.label || object.type.split(".").pop();
  const description =
    object.metadata.description || "Immersive block interface.";

  const Component = viewRegistry.get(object.type);

  const handleParamsChange = (newParams: any) => {
    updateObject(object.id, {
      metadata: {
        ...object.metadata,
        inputs: {
          ...((object.metadata.inputs as any) || {}),
          ...newParams,
        },
      },
    });
  };

  const polyfilledData = {
    input: object.metadata.inputs || object.metadata || {},
    output: object.metadata.outputs || {},
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={() => setExpansion(null, "none")}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[90vw] h-[85vh] bg-brand-bg-surface/95 border border-white/10 shadow-[0_0_100px_rgba(123,92,234,0.15)] rounded-[32px] overflow-hidden flex flex-col backdrop-blur-3xl"
        >
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                  {String(label)}
                  <span className="px-2 py-0.5 bg-brand-cyan/20 text-brand-cyan text-[9px] rounded-full">
                    IMMERSIVE MODE
                  </span>
                </h2>
                <p className="text-brand-text-muted text-[10px] tracking-widest uppercase">
                  {object.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpansion(object.id, "side-panel")}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Settings Inspector"
              >
                <Settings size={18} />
              </button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button
                onClick={() => setExpansion(null, "none")}
                className="p-2 text-white/50 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Immersive Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Interactive/Visual Area */}
            <div className="flex-[3] border-r border-white/5 p-8 relative flex flex-col overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_center,rgba(123,92,234,0.02)_0%,transparent_70%)]">
              {Component ? (
                <div className="w-full max-w-4xl mx-auto">
                  <Component
                    object={object}
                    data={polyfilledData as any}
                    onParamsChange={handleParamsChange}
                  />
                </div>
              ) : (
                <div className="flex-1 border border-white/5 rounded-2xl bg-black/20 flex flex-col items-center justify-center overflow-hidden relative group">
                  <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Maximize2 size={48} className="text-white/10 mb-4" />
                  <p className="text-white/60 font-black tracking-widest uppercase text-sm">
                    No Immersive View Registered
                  </p>
                  <p className="text-brand-text-muted font-mono text-[10px] mt-2">
                    {object.type}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Configuration / Data Area */}
            <div className="flex-1 bg-white/[0.02] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 max-w-md shrink-0">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan mb-2">
                  Description
                </h3>
                <p className="text-sm text-brand-text-body leading-relaxed">
                  {String(description)}
                </p>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-4">
                  Raw Metadata Payload
                </h3>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-brand-purple/80 overflow-x-auto border border-white/5 shadow-inner">
                  <pre>{JSON.stringify(object.metadata, null, 2)}</pre>
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-2">
                <button className="w-full py-3 bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Settings size={14} />
                  Open Side Inspector
                </button>
                <button
                  onClick={() => setExpansion(null, "none")}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  Return to Canvas
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
