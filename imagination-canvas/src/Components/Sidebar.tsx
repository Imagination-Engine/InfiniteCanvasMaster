import type { DragEvent } from "react";

// ─── Module Definitions ─────────────────────────────────────────────
// Each entry maps to a key in NODE_TYPES (see ./nodes/index.ts).
// To add a new module: add it here AND register its component in NODE_TYPES.
const MODULE_TYPES = [
  {
    type: "trigger",
    label: "Trigger",
    dot: "bg-emerald-500",
  },
  {
    type: "action",
    label: "Action",
    dot: "bg-blue-500",
  },
  {
    type: "filter",
    label: "Filter",
    dot: "bg-amber-500",
  },
  {
    type: "link",
    label: "Link",
    dot: "bg-blue-300",
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
      <h1 className="text-3xl font-bold text-slate-800 font-mono">Imagination Canvas</h1>

      
      
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
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-sm transition-all select-none"
          >
            {/* Color dot — matches the node's accent color */}
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${module.dot}`}
            />
            <span className="text-sm font-medium text-slate-600">
              {module.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-auto text-[11px] text-slate-400 text-center leading-relaxed">
        Drag a module onto the canvas to add it to
        your flow.
      </p>
    </aside>
  );
}
