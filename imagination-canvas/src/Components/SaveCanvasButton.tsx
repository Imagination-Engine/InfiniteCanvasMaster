import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { UnifiedCanvasDocument } from '../nodes/canvasTypes';
import { Save } from 'lucide-react';

type SaveCanvasButtonProps = {
  onSave?: (document: UnifiedCanvasDocument) => Promise<void> | void;
};

export default function SaveCanvasButton({ onSave }: SaveCanvasButtonProps) {
  const { toObject } = useReactFlow();
  // const { nodes, edges } = useCanvasStore(); // Using toObject() instead to capture viewport state
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    
    try {
      // 1. Extract the raw state from React Flow Engine
      // We use toObject() because it includes the viewport and measured dimensions,
      // which are not tracked in the global Zustand store (performance optimization).
      const rawReactFlowState = toObject();
      const unifiedDocument = rawReactFlowState as unknown as UnifiedCanvasDocument;

      console.log("Saving canvas:", JSON.stringify(unifiedDocument, null, 2));

      // 2. Persist the data
      if (onSave) {
        await onSave(unifiedDocument);
      } else {
        // Imitates network delay for UX
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save canvas", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <button 
      onClick={handleSave}
      disabled={status === 'saving'}
      className={`flex items-center justify-center gap-2 w-full mt-4 text-white px-4 py-3 rounded-xl shadow-sm transition-all font-bold text-[11px] uppercase tracking-widest ${
        status === 'error' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30' : status === 'saved' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-gradient-to-r from-brand-purple to-brand-cyan shadow-[0_4px_12px_-2px_rgba(123,92,234,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(0,194,255,0.4)] hover:-translate-y-[1px] active:scale-[0.98]'
      } disabled:opacity-60 disabled:pointer-events-none`}
    >
      <Save className="h-4 w-4" />
      {status === "idle"
        ? "Save Canvas Data"
        : status === "saving"
          ? "Saving..."
          : status === "saved"
            ? "Saved"
            : "Error"}
    </button>
  );
}
