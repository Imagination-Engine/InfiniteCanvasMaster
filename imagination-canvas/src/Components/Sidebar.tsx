import type { DragEvent } from "react";
import {
  FileText,
  Image,
  Video,
  Code,
  MessageSquare,
  Terminal,
  ShoppingBag,
  Globe,
  Table,
  List,
  Sparkles,
  Group,
  Mic,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BlockType } from "../canvas/types/blockTypes";
import SaveCanvasButton from "./SaveCanvasButton";

// ─── Block Palette Definitions ──────────────────────────────────────
// Each entry maps to a BlockType and a key in NODE_TYPES (./nodes/index.ts).
// To add a new block: add it here, define its content type in block.types.ts,
// add its default in block.factory.ts, and register its component in NODE_TYPES.

interface BlockPaletteEntry {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  color: string;
}

const BLOCK_PALETTE: BlockPaletteEntry[] = [
  { type: "content",      label: "Content",      icon: FileText,       color: "text-blue-500" },
  { type: "image",        label: "Image",        icon: Image,          color: "text-violet-500" },
  { type: "video",        label: "Video",        icon: Video,          color: "text-rose-500" },
  { type: "code",         label: "Code",         icon: Code,           color: "text-emerald-500" },
  { type: "chat",         label: "Chat",         icon: MessageSquare,  color: "text-sky-500" },
  { type: "sandbox",      label: "Sandbox",      icon: Terminal,       color: "text-orange-500" },
  { type: "product",      label: "Product",      icon: ShoppingBag,    color: "text-pink-500" },
  { type: "browser",      label: "Browser",      icon: Globe,          color: "text-cyan-500" },
  { type: "datatable",    label: "Data Table",   icon: Table,          color: "text-teal-500" },
  { type: "listicle",     label: "Listicle",     icon: List,           color: "text-amber-500" },
  { type: "aigenerative", label: "AI Generate",  icon: Sparkles,       color: "text-purple-500" },
  { type: "audio",        label: "Audio",        icon: Mic,       color: "text-rose-500" },
  { type: "group",        label: "Group",        icon: Group,          color: "text-slate-400" },
];

/**
 * Sidebar — draggable module palette.
 *
 * Uses HTML5 Drag-and-Drop to let users drag tiles onto the Canvas.
 * The drag payload ('application/reactflow') carries the module type string.
 */
export function Sidebar() {
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    moduleType: string,
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      moduleType,
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-white/85 backdrop-blur-md border-r border-slate-200 flex flex-col z-10 overflow-hidden">
      <div className="shrink-0 p-6 pb-2 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 font-mono">
          Imagination Canvas
        </h1>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Modules
        </h3>
      </div>

      {/* Scrollable Node Container — extra horizontal padding prevents clipping during scale/shadow */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 custom-scrollbar">
        {BLOCK_PALETTE.map((block) => (
          <div
            key={block.type}
            draggable
            onDragStart={(e) =>
              onDragStart(e, block.type)
            }
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 cursor-grab active:cursor-grabbing hover:scale-[1.04] hover:shadow-lg hover:shadow-slate-200/50 transition-all select-none group"
          >
            <block.icon
              className={`w-4 h-4 shrink-0 ${block.color} transition-transform group-hover:scale-110`}
            />

            <span className="text-sm font-semibold text-slate-600 outline-none">
              {block.label}
            </span>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-6 pt-4 border-t border-slate-100 mt-auto bg-white/50">
        <p className="mb-4 text-[11px] text-slate-400 text-center leading-relaxed">
          Drag a module onto the canvas to add it to
          your flow.
        </p>
        <SaveCanvasButton />
      </div>
    </aside>
  );
}
