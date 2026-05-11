// @ts-nocheck
import React, { useState } from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";
import {
  Zap,
  Settings,
  Lock,
  Globe,
  Webhook,
  Clock,
  Database,
  AlertCircle,
  Minimize2,
  Maximize2,
  Play,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useCanvasStore } from "../../state/canvasStore";
import { blockRegistry } from "@iem/core";

export const ConductorBlockView: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
}) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const [running, setRunning] = useState(false);

  const isExpanded = mode === "fullscreen" || mode === "side-panel";
  const metadata = (object.metadata as any) || {};
  const inputs = metadata.inputs || {};
  const outputs = metadata.outputs || {};

  // Get definition from core registry for schema hints
  const definition = blockRegistry.get(object.type);

  const handleInputChange = (key: string, value: any) => {
    updateObject(object.id, {
      metadata: {
        ...metadata,
        inputs: {
          ...inputs,
          [key]: value,
        },
      },
    });
  };

  const handleMetadataChange = (key: string, value: any) => {
    updateObject(object.id, {
      metadata: {
        ...metadata,
        [key]: value,
      },
    });
  };

  const runBlock = async () => {
    setRunning(true);
    try {
      const response = await fetch("http://localhost:3001/api/blocks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: object.id,
          type: object.type,
          inputs,
        }),
      });

      const result = await response.json();
      updateObject(object.id, {
        status: "idle",
        metadata: {
          ...metadata,
          outputs: result,
        },
      });
    } catch (err) {
      console.error("Execution failed:", err);
      updateObject(object.id, {
        status: "error",
        metadata: {
          ...metadata,
          outputs: { error: String(err) },
        },
      });
    } finally {
      setRunning(false);
    }
  };

  if (isExpanded) {
    return (
      <div className="w-full h-full flex flex-col gap-8 p-10 text-white overflow-y-auto custom-scrollbar">
        {/* Intent Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
            <Globe size={14} />
            Intent & Context
          </h3>
          <textarea
            value={metadata.description || ""}
            onChange={(e) =>
              handleMetadataChange("description", e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-slate-300 outline-none focus:border-blue-400/50 transition-all min-h-[100px] resize-none"
            placeholder="Describe what this block is intended to achieve..."
          />
        </section>

        {/* Configuration Section */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
            <Settings size={14} />
            Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(inputs)
              .filter((k) => !["apiKey", "clientSecret"].includes(k))
              .map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 px-1">
                    {key}
                  </label>
                  <input
                    value={String(inputs[key] ?? "")}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500/50 transition-all"
                    placeholder={`Enter ${key}...`}
                  />
                </div>
              ))}
            {/* If no inputs yet, show some common ones based on type */}
            {Object.keys(inputs).filter(
              (k) => !["apiKey", "clientSecret"].includes(k),
            ).length === 0 && (
              <div className="col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                  No parameters defined. Start by adding values in the chat or
                  code.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Security Section (Always visible in expanded mode for conductor blocks) */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 flex items-center gap-2">
            <Lock size={14} />
            Security & Authentication
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 px-1">
                API Key / Bearer Token
              </label>
              <input
                type="password"
                value={String(inputs.apiKey ?? "")}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-rose-300 outline-none focus:border-rose-500/50 transition-all font-mono"
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 px-1">
                Client Secret
              </label>
              <input
                type="password"
                value={String(inputs.clientSecret ?? "")}
                onChange={(e) =>
                  handleInputChange("clientSecret", e.target.value)
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-rose-300 outline-none focus:border-rose-500/50 transition-all font-mono"
                placeholder="..."
              />
            </div>
          </div>
        </section>

        {/* Execution Control */}
        <div className="pt-8 border-t border-white/5 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={runBlock}
              disabled={running}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-3 transition-all"
            >
              {running ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {running ? "Executing..." : "Run Block"}
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Activity
              size={12}
              className={
                running ? "text-brand-cyan animate-pulse" : "text-white/20"
              }
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
              Status: {running ? "Active" : object.status || "Idle"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Compact View (On Canvas)
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Target Preview */}
      <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2 overflow-hidden shadow-inner">
        {object.type.includes("webFetch") && (
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
              Target URL
            </span>
            <div className="text-[10px] text-brand-cyan font-mono truncate bg-brand-cyan/5 border border-brand-cyan/10 p-1.5 rounded-lg">
              {String(inputs.url || "https://...")}
            </div>
          </div>
        )}

        {object.type.includes("webhook") && (
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
              Listen Path
            </span>
            <div className="text-[10px] text-amber-400 font-mono truncate bg-amber-400/5 border border-amber-400/10 p-1.5 rounded-lg">
              {String(inputs.path || "/api/webhook/...")}
            </div>
          </div>
        )}

        {!object.type.includes("webFetch") &&
          !object.type.includes("webhook") && (
            <div className="flex-1 flex items-center justify-center italic text-[9px] text-white/20">
              {definition?.description || "Awaiting configuration..."}
            </div>
          )}

        {outputs.data && (
          <div className="mt-1 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <ArrowRight size={10} className="text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
              Data Received
            </span>
          </div>
        )}
      </div>

      {/* Quick Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          runBlock();
        }}
        disabled={running}
        className="w-full py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        {running ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <Play size={10} />
        )}
        {running ? "Running" : "Test Block"}
      </button>
    </div>
  );
};
