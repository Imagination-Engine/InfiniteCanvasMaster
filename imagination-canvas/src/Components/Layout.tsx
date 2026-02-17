import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout component
 * 
 * Provides a base structure for the application, ensuring a full-screen
 * experience and handling global styling wrappers.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Dynamic Glow background for premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" />
      
      {children}
    </main>
  );
};
