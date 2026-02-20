import React from 'react';

/**
 * Props (Properties) interface for the Layout component.
 * Think of props like arguments passed to a function.
 * `children` represents any React components or HTML elements 
 * that will be placed inside this Layout when it's used.
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout component
 * 
 * This component acts as the main wrapper (think of it as the main window frame) 
 * for the entire application. It ensures everything takes up the full screen 
 * and applies some global background styling.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // <main> is the standard HTML tag for the main content of a document.
    // The classes here (from Tailwind CSS) do the following:
    // - relative: allows us to position items absolutely inside this container
    // - w-screen h-screen: makes this element exactly the width and height of your entire browser window
    // - overflow-hidden: prevents scrollbars from showing up if content tries to go off-screen
    // - bg-slate-50 text-slate-900: sets a very light gray background and dark text color
    <main className="relative w-screen h-screen overflow-hidden bg-slate-50 text-slate-900">
      
      {/* 
        Dynamic Glow backgrounds for a premium look.
        These are just decorative colored blurry circles placed in the background.
        
        Tailwind classes breakdown:
        - absolute: removes the element from the normal document flow so we can pin it to a corner
        - bg-blue-400/10: sets the background color to blue with 10% opacity (very faint)
        - blur-[120px]: makes the circle extremely blurry, creating a "glow" effect instead of a solid shape
        - pointer-events-none: CRUCIAL! This ensures that these glow effects don't block 
          you from clicking on buttons or interacting with the canvas underneath them.
      */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* 
        This is where the actual content of your app (the canvas, the toolbar, etc.) 
        gets injected and displayed on the screen.
      */}
      {children}
    </main>
  );
};
