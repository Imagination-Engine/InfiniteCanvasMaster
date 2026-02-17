import React from 'react';

/**
 * Overlay component for UI elements that sit on top of the canvas.
 * Uses pointer-events-none on the container and auto on children
 * to ensure clicks still pass through to the canvas where intended.
 */
export const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col justify-between p-6">
      {children}
    </div>
  );
};

export const ToolbarItems: React.FC = () => {
    return (
        <div className="flex gap-2 pointer-events-auto">
            {/* Simple example of custom overlay button */}
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-white transition-all active:scale-95"
            >
                🔄 Sync State
            </button>
        </div>
    );
};
