import React from 'react';

interface CanvasAffordanceProps {
  onOpen: () => void;
}

export const CanvasAffordance: React.FC<CanvasAffordanceProps> = ({ onOpen }) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <button 
        onClick={onOpen}
        className="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-all text-sm font-medium animate-pulse flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
        </svg>
        <span>I created a canvas for this. Open?</span>
      </button>
    </div>
  );
};
