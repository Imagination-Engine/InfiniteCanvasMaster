import React from "react";
import { useToolDisclosure } from "../hooks/useToolDisclosure";
import { ToolCall } from "../contracts";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolCallBlockProps {
  tool: ToolCall;
}

export const ToolCallBlock: React.FC<ToolCallBlockProps> = ({ tool }) => {
  const {
    isExpanded,
    toggleExpanded,
    viewMode,
    setHumanView,
    setDeveloperView,
  } = useToolDisclosure(false);

  return (
    <div className="flex flex-col gap-1 my-2 font-mono text-xs border border-white/10 rounded-lg bg-black/20 overflow-hidden">
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-2 p-2 hover:bg-white/5 transition-colors w-full text-left"
      >
        <span className="text-white/50">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="flex-1 text-brand-cyan">
          {tool.state === "executing" ? (
            <span className="animate-pulse">Executing {tool.toolName}...</span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={12} /> {tool.toolName}
            </span>
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="flex items-center gap-4 px-2 py-1 bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
              <button
                onClick={setHumanView}
                className={`hover:text-white transition-colors ${viewMode === "human" ? "text-white font-bold" : ""}`}
              >
                Artifact
              </button>
              <button
                onClick={setDeveloperView}
                className={`hover:text-white transition-colors ${viewMode === "developer" ? "text-white font-bold" : ""}`}
              >
                Raw JSON
              </button>
            </div>

            <div className="p-2 overflow-x-auto">
              {viewMode === "developer" ? (
                <pre className="text-[10px] text-slate-300">
                  {JSON.stringify(
                    { args: tool.args, result: tool.result },
                    null,
                    2,
                  )}
                </pre>
              ) : (
                <div className="text-slate-200">
                  {tool.result
                    ? "Artifact rendered successfully."
                    : "Waiting for result..."}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
