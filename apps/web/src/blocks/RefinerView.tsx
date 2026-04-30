import React from 'react';
import type { BlockViewProps } from '@iem/core';

export const RefinerView: React.FC<BlockViewProps<any, any>> = ({ data, onParamsChange, onRun }) => {
  return (
    <div className="min-w-[260px] rounded-2xl border border-brand-purple/40 bg-brand-bg-surface/90 backdrop-blur-xl p-4 text-white shadow-2xl">
      <div className="font-bold uppercase tracking-widest text-brand-purple mb-2">Refiner</div>
      <div className="text-xs mb-4 text-brand-text-muted">Refine text into a specific writing style.</div>
      <button 
        onClick={onRun}
        className="px-4 py-2 bg-brand-purple text-white rounded text-xs uppercase"
      >
        Run
      </button>
      {data.status === 'running' && <div className="text-xs text-yellow-400 mt-2">Running...</div>}
      {data.output?.text && (
        <div className="mt-4 p-2 bg-black/20 rounded text-xs">{data.output.text}</div>
      )}
    </div>
  );
};