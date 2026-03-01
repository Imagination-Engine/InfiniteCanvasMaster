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
import logo from "../assets/logo.svg";
import SaveCanvasButton from "./SaveCanvasButton";
import type { CanvasDocument } from "../canvas/types/blockTypes";

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
type SidebarProps = {
  onSave?: (document: CanvasDocument) => Promise<void> | void;
};

export function Sidebar({ onSave }: SidebarProps) {
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
    <aside className="w-[220px] min-w-[220px] h-full bg-brand-bg-surface/95 backdrop-blur-2xl border-r border-white/5 flex flex-col z-10 overflow-hidden">
      <div className="shrink-0 p-6 pb-2 flex flex-col gap-4">
        <div className="flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="Balnce Logo" 
            width={32}
            height={32}
            className="w-8 h-8 object-contain transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(123,92,234,0.3)]" 
          />
          <h1 className="text-[18px] font-black tracking-tighter text-white uppercase leading-none">
            BALNCE <span className="text-brand-purple">AI</span>
          </h1>
        </div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-text-muted">
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
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-grab active:cursor-grabbing hover:scale-[1.04] hover:bg-white/[0.06] hover:border-brand-purple/30 hover:shadow-[0_8px_20px_-5px_rgba(123,92,234,0.2)] transition-all select-none group"
          >
            <block.icon
              className={`w-4 h-4 shrink-0 ${block.color} transition-transform group-hover:scale-110`}
            />

            <span className="text-sm font-semibold text-brand-text-body group-hover:text-white transition-colors outline-none">
              {block.label}
            </span>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-6 pt-4 border-t border-white/5 mt-auto bg-black/20">
        <p className="mb-4 text-[11px] text-brand-text-muted font-medium text-center leading-relaxed">
          Drag a module onto the canvas to unleash your imagination.
        </p>
        <SaveCanvasButton onSave={onSave} />
      </div>
    </aside>
  );
}
