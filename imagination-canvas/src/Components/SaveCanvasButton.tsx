import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { exportCanvasToJsonCanvas } from '../canvas/adapters/jsonCanvasAdapter';
import type { CanvasDocument } from '../canvas/types/blockTypes';
import { Save } from 'lucide-react';

type SaveCanvasButtonProps = {
  onSave?: (document: CanvasDocument) => Promise<void> | void;
};

export default function SaveCanvasButton({ onSave }: SaveCanvasButtonProps) {
  const { toObject } = useReactFlow();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    
    // 1. Extract the raw state from React Flow Engine
    const rawReactFlowState = toObject();
    
    // 2. Pass it through the JSON Canvas adapter for interoperable export
    const jsonCanvasOutput = exportCanvasToJsonCanvas(rawReactFlowState as unknown as CanvasDocument);

    try {
      if (onSave) {
        await onSave(rawReactFlowState as unknown as CanvasDocument);
      } else {
        // Logs the JSON Canvas data ready for export or backend persistence
        console.log("Saving JSON Canvas:", JSON.stringify(jsonCanvasOutput, null, 2));
        // Imitates network delay for UX
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error("Failed to save canvas", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <button 
      onClick={handleSave}
      disabled={status === 'saving'}
      className="flex items-center justify-center gap-2 w-full mt-4 bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-900 hover:shadow-md hover:-translate-y-[1px] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none font-semibold text-sm"
    >
      <Save className="w-4 h-4" />
      {status === 'idle'
        ? 'Save Canvas Data'
        : status === 'saving'
          ? 'Saving...'
          : status === 'saved'
            ? 'Saved'
            : 'Error'}
    </button>
  );
}
