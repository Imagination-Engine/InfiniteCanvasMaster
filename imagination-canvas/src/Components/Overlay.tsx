import React from 'react';

/**
 * Overlay Component
 * 
 * This component acts as a transparent layer floating directly on top of the Canvas.
 * It's used to hold UI elements like toolbars, menus, or floating buttons.
 * 
 * HOW IT WORKS:
 * - We use `pointer-events-none` on the main container. This makes the entire container "invisible"
 *   to clicks, meaning if a user clicks on the empty space of this overlay, the click passes right 
 *   through to the Canvas underneath (allowing them to pan or select things).
 * - For the child components (like the ToolbarItems below), we have to explicitly turn clicks back 
 *   on using `pointer-events-auto`, so the buttons can actually be clicked!
 */
export const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // - absolute inset-0: Stretches the overlay to perfectly cover the entire screen
    // - z-[1000]: Ensures this overlay floats high above the canvas (which has a lower z-index)
    // - pointer-events-none: Lets standard clicks pass through to the canvas below
    <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col justify-between p-6">
      {children}
    </div>
  );
};

/**
 * ToolbarItems Component
 * 
 * A simple example of UI elements that live inside the Overlay.
 */
export const ToolbarItems: React.FC = () => {
    return (
        // - pointer-events-auto: CRUCIAL! Because the parent Overlay turned off pointer events, 
        //   we MUST turn them back on for this specific toolbar, otherwise our buttons won't work.
        <div className="flex gap-2 pointer-events-auto">
            
            {/* 
              A simple example button. 
              The classes provide a frosted glass effect (backdrop-blur-md) 
              and a subtle click animation (active:scale-95).
            */}
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-white transition-all active:scale-95"
            >
                Reset View
            </button>
        </div>
    );
};
