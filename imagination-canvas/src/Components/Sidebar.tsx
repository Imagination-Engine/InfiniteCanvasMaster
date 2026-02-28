import type { DragEvent } from "react";
import {
  Zap,
  Play,
  Filter,
  Share2,
  Mic,
} from "lucide-react";
import SaveCanvasButton from "./SaveCanvasButton";

// ─── Module Definitions ─────────────────────────────────────────────
// Each entry maps to a key in NODE_TYPES (see ./nodes/index.ts).
// To add a new module: add it here AND register its component in NODE_TYPES.
const MODULE_TYPES = [
  {
    type: "trigger",
    label: "Trigger",
    icon: Zap,
    color: "text-emerald-500",
  },
  {
    type: "action",
    label: "Action",
    icon: Play,
    color: "text-blue-500",
  },
  {
    type: "filter",
    label: "Filter",
    icon: Filter,
    color: "text-amber-500",
  },
  {
    type: "link",
    label: "Link",
    icon: Share2,
    color: "text-blue-300",
  },
  {
    type: "audioRecording",
    label: "Audio",
    icon: Mic,
    color: "text-rose-500",
  },
] as const;

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
    <aside className="w-[220px] min-w-[220px] p-6 bg-white/85 backdrop-blur-md border-r border-slate-200 flex flex-col gap-4 z-10">
      <h1 className="text-2xl font-bold text-slate-800 font-mono">
        Imagination Canvas
      </h1>

      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Modules
      </h3>

      <div className="flex flex-col gap-2">
        {MODULE_TYPES.map((module) => (
          <div
            key={module.type}
            draggable
            onDragStart={(e) =>
              onDragStart(e, module.type)
            }
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-md transition-all select-none group"
          >
            {/* Lucide Icon — matches the node's accent color */}
            <module.icon
              className={`w-4 h-4 shrink-0 ${module.color} transition-transform group-hover:scale-110`}
            />

            <span className="text-sm font-semibold text-slate-600">
              {module.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-auto text-[11px] text-slate-400 text-center leading-relaxed">
        Drag a module onto the canvas to add it to
        your flow.
      </p>

      <SaveCanvasButton />
    </aside>
  );
}
