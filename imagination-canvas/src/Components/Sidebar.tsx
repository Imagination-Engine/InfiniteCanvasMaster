import React from 'react';

/**
 * MODULE_TYPES defines the different kinds of blocks we can create.
 * Each has an ID (for logic) and a color (for the UI).
 */
const MODULE_TYPES = [
  { id: 'trigger', label: 'Trigger', color: 'bg-emerald-500' },
  { id: 'action', label: 'Action', color: 'bg-blue-500' },
  { id: 'filter', label: 'Filter', color: 'bg-amber-500' },
];

/**
 * Sidebar Component
 * 
 * This component displays a list of draggable modules. 
 * We use the native HTML5 Drag and Drop API here.
 */
export const Sidebar = () => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Modules</h3>
      
      <div className="flex flex-col gap-3">
        {MODULE_TYPES.map((block) => (
          <div
            key={block.id}
            // 1. draggable="true" tells the browser this element can be dragged.
            draggable="true"
            // 2. onDragStart is called the moment the user starts dragging.
            onDragStart={(e) => {
              // We use e.dataTransfer.setData to "attach" the block ID to the drag event.
              // This is like putting a label on a package before shipping it to the canvas.
              e.dataTransfer.setData('blockType', block.id);
            }}
            className="flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all bg-slate-50 border border-slate-100 shadow-sm"
          >
            {/* A small colored dot to represent the module type */}
            <div className={`w-3 h-3 rounded-full ${block.color}`} />
            <span className="font-medium text-slate-700">{block.label}</span>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-[10px] text-slate-400 text-center leading-relaxed">
        Drag a module onto the canvas to start building your flow.
      </p>
    </div>
  );
};
