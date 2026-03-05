import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { exportCanvasToJsonCanvas } from '../canvas/adapters/jsonCanvasAdapter';
import type { CanvasDocument } from '../canvas/types/blockTypes';
import { useCanvasStore } from '../canvas/store/useCanvasStore';
import { Save } from 'lucide-react';

export default function SaveCanvasButton() {
  const { toObject } = useReactFlow();
  const { nodes, edges } = useCanvasStore();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    
    // 1. Extract the raw state from React Flow Engine
    const rawReactFlowState = toObject();
    
    // 2. We can also use the store state directly which might be more reliable
    // for our custom data structure, but toObject() gives us viewport and measured dims.
    // Let's stick with toObject for now but ensure we cast correctly.
    
    // 2. Pass it through the JSON Canvas adapter for interoperable export
    const jsonCanvasOutput = exportCanvasToJsonCanvas(rawReactFlowState as unknown as CanvasDocument);

    // Logs the JSON Canvas data ready for export or backend persistence
    console.log("Saving JSON Canvas:", JSON.stringify(jsonCanvasOutput, null, 2));
    
    // Imitates network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <button 
      onClick={handleSave}
      disabled={status === 'saving'}
      className="flex items-center justify-center gap-2 w-full mt-4 bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-900 hover:shadow-md hover:-translate-y-[1px] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none font-semibold text-sm"
    >
      <Save className="w-4 h-4" />
      {status === 'idle' ? 'Save Canvas Data' : status === 'saving' ? 'Extracting...' : 'Saved! Check Console'}
    </button>
  );
}
