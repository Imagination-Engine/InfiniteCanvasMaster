// @ts-nocheck
import React from "react";
import {
  MousePointer2,
  Hand,
  Pencil,
  Type,
  Square,
  Share2,
  Plus,
} from "lucide-react";

export type ToolType =
  | "select"
  | "hand"
  | "draw"
  | "text"
  | "shape"
  | "connector";

export interface LeftToolDockProps {
  activeTool?: ToolType;
  onToolSelect?: (tool: ToolType) => void;
  className?: string;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "hand", icon: Hand, label: "Hand" },
  { id: "draw", icon: Pencil, label: "Draw" },
  { id: "text", icon: Type, label: "Text" },
  { id: "shape", icon: Square, label: "Shape" },
  { id: "connector", icon: Share2, label: "Connector" },
] as const;

export const LeftToolDock: React.FC<LeftToolDockProps> = ({
  activeTool = "select",
  onToolSelect,
  className,
}) => {
  return (
    <div
      className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 p-1.5 rounded-2xl bg-brand-bg-card/80 backdrop-blur-md border border-white/10 shadow-xl ${className}`}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          aria-label={tool.label}
          onClick={() => onToolSelect?.(tool.id)}
          className={`p-3 rounded-xl transition-all duration-200 group relative ${
            activeTool === tool.id
              ? "bg-brand-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "text-white/40 hover:bg-white/5 hover:text-white"
          }`}
        >
          <tool.icon size={20} strokeWidth={2} />
          <div className="absolute left-full ml-3 px-2 py-1 rounded bg-black text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            {tool.label}
          </div>
        </button>
      ))}
      <div className="h-px bg-white/5 mx-2 my-1" />
      <button
        aria-label="Quick Add"
        className="p-3 rounded-xl text-brand-cyan hover:bg-brand-cyan/10 transition-colors"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};
