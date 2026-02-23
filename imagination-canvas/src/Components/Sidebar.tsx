import type { DragEvent } from "react";

// ─── Module Definitions ─────────────────────────────────────────────
// Each entry maps to a key in NODE_TYPES (see ./nodes/index.ts).
// To add a new module: add it here AND register its component in NODE_TYPES.
const MODULE_TYPES = [
  {
    type: "trigger",
    label: "Trigger",
    color: "#10b981",
  }, // emerald-500
  {
    type: "action",
    label: "Action",
    color: "#3b82f6",
  }, // blue-500
  {
    type: "filter",
    label: "Filter",
    color: "#f59e0b",
  }, // amber-500
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
    <aside className="sidebar">
      <h3 className="sidebar-title">Modules</h3>

      <div className="sidebar-modules">
        {MODULE_TYPES.map((module) => (
          <div
            key={module.type}
            className="sidebar-module"
            draggable
            onDragStart={(e) =>
              onDragStart(e, module.type)
            }
          >
            <span
              className="sidebar-module-dot"
              style={{
                backgroundColor: module.color,
              }}
            />
            <span className="sidebar-module-label">
              {module.label}
            </span>
          </div>
        ))}
      </div>

      <p className="sidebar-hint">
        Drag a module onto the canvas to add it to
        your flow.
      </p>
    </aside>
  );
}
