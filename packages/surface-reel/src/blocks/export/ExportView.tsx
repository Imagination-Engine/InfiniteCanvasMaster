import React from 'react';
import type { BlockViewProps } from '@iem/core';

export const ExportView: React.FC<BlockViewProps<any, any>> = ({ id, data, onParamsChange, onRun }) => {
  return (
    <div 
      data-testid="export-view"
      className="min-w-[260px] rounded-2xl border border-white/10 bg-brand-bg-surface/90 backdrop-blur-xl p-4 text-white shadow-2xl"
    >
      <div className="font-bold uppercase tracking-widest text-brand-purple mb-2">Export</div>
      <button
        onClick={onRun}
        className="px-4 py-2 bg-brand-purple text-white rounded text-xs uppercase font-bold"
      >
        Run
      </button>
      {data.status === 'running' && <div className="text-xs text-yellow-400 mt-2">Running...</div>}
      {data.output && (
        <div className="mt-4 p-2 bg-black/20 rounded text-xs overflow-auto max-h-32">
          <pre>{JSON.stringify(data.output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
