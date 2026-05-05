// @ts-nocheck
import React from "react";
import { useExpansionStore } from "../state/expansionStore";
import { useCanvasStore } from "../state/canvasStore";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OpenClawBlockInspector } from "./blocks/OpenClawBlockInspector";

export const SideInspector: React.FC = () => {
  const { activeId, mode, setExpansion } = useExpansionStore();
  const object = useCanvasStore((s) => (activeId ? s.objects[activeId] : null));

  if (mode !== "side-panel") return null;

  const isOpenClaw = object?.type === "openclaw.block";

  return (
    <AnimatePresence>
      {object && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className="absolute top-0 right-0 w-80 h-full bg-brand-bg-surface border-l border-white/10 shadow-2xl z-[100] flex flex-col backdrop-blur-3xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/80 italic">
              {isOpenClaw ? "OpenClaw Runtime" : "Inspector"}
            </div>
            <button
              onClick={() => setExpansion(null, "none")}
              className="p-1 hover:bg-white/5 rounded text-white/50"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {isOpenClaw ? (
              <OpenClawBlockInspector object={object} />
            ) : (
              <>
                <section>
                  <div className="text-[10px] uppercase text-brand-text-muted mb-2 font-bold tracking-tighter">
                    Properties
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">ID</span>
                      <span className="text-white font-mono opacity-80 uppercase text-[10px]">
                        {object.id}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Type</span>
                      <span className="text-white font-mono opacity-80 uppercase text-[10px]">
                        {object.type}
                      </span>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="text-[10px] uppercase text-brand-text-muted mb-2 font-bold tracking-tighter">
                    Metadata
                  </div>
                  <pre className="text-[10px] bg-black/40 p-3 rounded-lg border border-white/5 text-brand-cyan/80 font-mono overflow-auto max-h-40">
                    {JSON.stringify(object.metadata, null, 2)}
                  </pre>
                </section>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
