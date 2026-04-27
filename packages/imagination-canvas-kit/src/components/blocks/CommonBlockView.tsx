import React from "react";
import { CanvasObject } from "../../contracts";
import {
  Sparkles,
  Zap,
  Group,
  Search,
  Terminal,
  Plus,
  Box,
  Cpu,
  Database,
  Play,
  Settings,
  HelpCircle,
} from "lucide-react";

const getSurfaceIcon = (type: string) => {
  if (type.startsWith("iem.scribe")) return Sparkles;
  if (type.startsWith("iem.playable")) return Zap;
  if (type.startsWith("iem.atlas")) return Database;
  if (type.startsWith("iem.reel")) return Play;
  if (type.startsWith("iem.conductor")) return Cpu;
  if (type.startsWith("iem.core")) return Settings;
  return Box;
};

const getSurfaceColor = (type: string) => {
  if (type.startsWith("iem.scribe")) return "text-brand-cyan";
  if (type.startsWith("iem.playable")) return "text-amber-400";
  if (type.startsWith("iem.atlas")) return "text-emerald-400";
  if (type.startsWith("iem.reel")) return "text-rose-400";
  if (type.startsWith("iem.conductor")) return "text-brand-purple";
  if (type.startsWith("iem.core")) return "text-brand-cyan";
  return "text-white/40";
};

export const CommonBlockView: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const Icon = getSurfaceIcon(object.type);
  const colorClass = getSurfaceColor(object.type);
  const label = object.metadata.label || object.type.split(".").pop();
  const description = object.metadata.description || "Holonic Block";

  return (
    <div
      className="bg-brand-bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 overflow-hidden group transition-all hover:border-white/20"
      style={{ width: object.width, height: object.height }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${colorClass}`}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate leading-none mb-1">
              {label}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
                {object.type.split(".")[1] || "Core"}
              </span>
              <div
                className={`w-1 h-1 rounded-full ${object.status === "thinking" ? "bg-brand-cyan animate-pulse" : "bg-emerald-500/50"}`}
              />
            </div>
          </div>
        </div>
        <HelpCircle
          size={14}
          className="text-white/10 group-hover:text-white/30 transition-colors"
        />
      </div>

      <div className="flex-1 min-h-0 bg-black/20 rounded-xl p-3 border border-white/5 overflow-auto custom-scrollbar">
        <p className="text-[11px] text-white/60 leading-relaxed font-medium mb-3">
          {description}
        </p>

        {/* Render simple metadata values if present */}
        <div className="space-y-2">
          {Object.entries(object.metadata).map(([key, val]) => {
            if (["label", "description", "category"].includes(key)) return null;
            if (typeof val === "object") return null;
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                  {key}
                </span>
                <span className="text-[10px] text-white/80 font-mono truncate">
                  {String(val)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex -space-x-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-brand-bg-surface bg-white/10"
            />
          ))}
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95">
          Execute
        </button>
      </div>
    </div>
  );
};
