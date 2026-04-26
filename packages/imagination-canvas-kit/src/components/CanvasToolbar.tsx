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
  Zap,
} from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";
import { useSelectionStore } from "../state/selectionStore";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { canvasTouchTargets } from "../tokens";

export const CanvasToolbar: React.FC = () => {
  const addObject = useCanvasStore((s) => s.addObject);
  const { selectedIds, clearSelection } = useSelectionStore();
  const removeObject = useCanvasStore((s) => s.removeObject);
  const { capture, undo, redo } = useCanvasHistory();

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
    });
  };

  const handleStressTest = () => {
    capture();
    for (let i = 0; i < 5000; i++) {
      addObject({
        id: `stress-${i}-${Date.now()}`,
        type: "shape",
        x: Math.random() * 10000 - 5000,
        y: Math.random() * 10000 - 5000,
        width: 100,
        height: 100,
        zIndex: 0,
        metadata: {},
      });
    }
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
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50">
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
      <div className="w-px h-6 bg-white/10 mx-1" />
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
      <div className="w-px h-6 bg-white/10 mx-1" />
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
      <div className="w-px h-6 bg-white/10 mx-1" />
      <button
        onClick={handleStressTest}
        style={buttonStyle}
        title="Stress Test (5k objects)"
        className="flex items-center justify-center text-amber-500/50 hover:text-amber-500 hover:bg-white/5 rounded-xl transition-all"
      >
        <Zap size={20} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1" />
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
