import React from 'react';
import type { BlockViewProps } from '@iem/core';

export const GenericBlockView: React.FC<BlockViewProps<any, any>> = ({ data, onRun }) => {
  return (
    <div className="min-w-[260px] rounded-2xl border border-brand-cyan/40 bg-brand-bg-surface/90 backdrop-blur-xl p-4 text-white shadow-2xl">
      <div className="font-bold uppercase tracking-widest text-brand-cyan mb-2">Block</div>
      <button 
        onClick={onRun}
        className="px-4 py-2 bg-brand-cyan text-black font-bold rounded text-xs uppercase"
      >
        Run
      </button>
      {data.status === 'running' && <div className="text-xs text-yellow-400 mt-2">Running...</div>}
      {data.output && (
        <div className="mt-4 p-2 bg-black/20 rounded text-xs overflow-auto max-h-32">
          {JSON.stringify(data.output)}
        </div>
      )}
    </div>
  );
};