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
      className={`flex items-center justify-center gap-2 w-full mt-4 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all font-semibold text-sm ${
        status === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-900 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]'
      } disabled:opacity-70 disabled:pointer-events-none`}
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
