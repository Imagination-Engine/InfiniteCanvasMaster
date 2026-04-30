import React from 'react';
import { useViewStore, type ViewMode } from '../../store/useViewStore';
import { ChatShell } from '../Chat/ChatShell';

interface MainLayoutProps {
  canvasComponent: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ canvasComponent }) => {
  const { viewMode, setViewMode } = useViewStore();

  const renderViewToggle = () => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex bg-white/80 backdrop-blur shadow-md rounded-full border border-gray-200 p-1 z-50">
      <button
        onClick={() => setViewMode('chat')}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          viewMode === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        CHAT
      </button>
      <button
        onClick={() => setViewMode('dual')}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          viewMode === 'dual' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        DUAL
      </button>
      <button
        onClick={() => setViewMode('canvas')}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          viewMode === 'canvas' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        CANVAS
      </button>
    </div>
  );

  return (
    <div className="relative flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-100">
      {renderViewToggle()}

      {/* Chat View */}
      {(viewMode === 'chat' || viewMode === 'dual') && (
        <div className={`
          ${viewMode === 'dual' ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full'} 
          border-b md:border-b-0 md:border-r border-gray-200
        `}>
          <ChatShell projectId="layout-default" />
        </div>
      )}

      {/* Canvas View */}
      {(viewMode === 'canvas' || viewMode === 'dual') && (
        <div className={`
          ${viewMode === 'dual' ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full'}
        `}>
          {canvasComponent}
        </div>
      )}
    </div>
  );
};
