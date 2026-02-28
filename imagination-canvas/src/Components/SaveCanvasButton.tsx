import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { serializeCanvasToBalnceSpec } from '../utils/canvasAdapter';
import { Save } from 'lucide-react';

export default function SaveCanvasButton() {
  const { toObject } = useReactFlow();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    
    // 1. Extract the raw state from React Flow Engine
    const rawReactFlowState = toObject();
    
    // 2. Pass it through the serialization adapter
    const cleanAdaptedGraph = serializeCanvasToBalnceSpec(rawReactFlowState);

    // Logs the cleaned data that is ready for the Knowledge Graph/Backend
    console.log("Saving clean graph logic:", JSON.stringify(cleanAdaptedGraph, null, 2));
    
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
