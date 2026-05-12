// @ts-nocheck
import React from "react";
import {
  MousePointer2,
  Hand,
  Square,
  StickyNote,
  Type,
  Trash2,
  Undo2,
  Redo2,
  Play,
  Loader2,
} from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { canvasTouchTargets } from "../tokens";

interface CanvasToolbarProps {
  onRunGraph?: () => void;
  isRunning?: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onRunGraph,
  isRunning,
}) => {
  const addObject = useCanvasStore((s) => s.addObject);
  const { selectedIds, clearSelection } = useSelectionStore();
  const removeObject = useCanvasStore((s) => s.removeObject);
  const { undo, redo, capture } = useCanvasHistory();

  const handleAddNote = () => {
    capture();
    const id = `note-${Date.now()}`;
    addObject({
      id,
      type: "note",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      zIndex: 1,
      metadata: { text: "New Note" },
      status: "idle",
      rotation: 0,
    });
  };

  const handleDelete = () => {
    capture();
    selectedIds.forEach((id) => removeObject(id));
    clearSelection();
  };

  const buttonStyle = {
    minWidth: canvasTouchTargets.minimum,
    minHeight: canvasTouchTargets.minimum,
  };

  return (
    <div className="absolute bottom-8 left-8 flex flex-col items-center gap-2 p-2 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50">
      {onRunGraph && (
        <>
          <button
            onClick={onRunGraph}
            disabled={isRunning}
            style={buttonStyle}
            className="flex items-center justify-center text-brand-cyan hover:bg-brand-cyan/10 rounded-xl transition-all shadow-[0_0_15px_rgba(0,194,255,0.2)] disabled:opacity-50"
            title="Run Graph"
          >
            {isRunning ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>
          <div className="h-px w-6 bg-white/10 my-1" />
        </>
      )}

      <button
        onClick={undo}
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <Undo2 size={20} />
      </button>
      <button
        onClick={redo}
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <Redo2 size={20} />
      </button>

      <div className="h-px w-6 bg-white/10 my-1" />

      <button
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <MousePointer2 size={20} />
      </button>
      <button
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <Hand size={20} />
      </button>

      <div className="h-px w-6 bg-white/10 my-1" />

      <button
        onClick={handleAddNote}
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <StickyNote size={20} />
      </button>
      <button
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <Type size={20} />
      </button>
      <button
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-brand-cyan hover:bg-white/5 rounded-xl transition-all"
      >
        <Square size={20} />
      </button>

      <div className="h-px w-6 bg-white/10 my-1" />

      <button
        onClick={handleDelete}
        disabled={selectedIds.length === 0}
        style={buttonStyle}
        className="flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all disabled:opacity-20"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};
