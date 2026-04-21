import React, { useState } from 'react';
import { 
  Plus, 
  History, 
  LayoutGrid, 
  List as ListIcon, 
  Search, 
  Package, 
  Settings, 
  User,
  LogOut,
  MessageSquare,
  Box
} from 'lucide-react';

interface SessionSummary {
  id: string;
  title: string;
  updatedAt: string;
  hasCanvas: boolean;
  thumbnailUrl?: string;
}

const MOCK_HISTORY: SessionSummary[] = [
  { id: '1', title: 'Friday weekend idea...', updatedAt: '2026-04-17', hasCanvas: true },
  { id: '2', title: 'First game experiment', updatedAt: '2026-04-16', hasCanvas: true },
  { id: '3', title: 'Anime test scene', updatedAt: '2026-04-15', hasCanvas: false },
];

const HistoryListItem: React.FC<{ item: SessionSummary }> = ({ item }) => (
  <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-sm transition-colors text-left group">
    {item.hasCanvas ? (
      <Box size={14} className="text-blue-400 shrink-0" />
    ) : (
      <MessageSquare size={14} className="text-gray-500 shrink-0" />
    )}
    <span className="truncate flex-1 font-medium">{item.title}</span>
    <span className="text-[10px] text-gray-600 hidden group-hover:block shrink-0">
      {item.updatedAt}
    </span>
  </button>
);

const HistoryGridItem: React.FC<{ item: SessionSummary }> = ({ item }) => (
  <button className="aspect-square bg-gray-800 rounded-xl p-2 flex flex-col gap-2 hover:bg-gray-700 transition-all border border-white/5 hover:border-blue-500/30 group relative overflow-hidden">
    {item.hasCanvas ? (
      <div className="flex-1 bg-gray-900/50 rounded-lg flex items-center justify-center">
        <Box size={24} className="text-gray-700 group-hover:text-blue-500/50 transition-colors" />
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center italic text-[10px] text-gray-600 text-center px-1">
        Chat Only
      </div>
    )}
    <div className="text-[10px] font-bold truncate w-full text-center">
      {item.title}
    </div>
  </button>
);

export const NavigationSidebar: React.FC<{ items?: SessionSummary[] }> = ({ items = MOCK_HISTORY }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleView = () => {
    setViewMode(prev => prev === 'list' ? 'grid' : 'list');
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[260px] h-full bg-[#0a0a0b] text-gray-300 flex flex-col border-r border-white/5">
      {/* Top Actions */}
      <div className="p-4 pt-6 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-all font-bold shadow-lg shadow-blue-900/20 active:scale-95">
          <Plus size={18} strokeWidth={3} />
          <span>New Chat</span>
        </button>
      </div>

      {/* History Section */}
      <div className="flex-1 flex flex-col overflow-hidden px-2">
        <div className="px-3 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mt-2">
          <div className="flex items-center gap-2">
            <History size={13} />
            <span>History</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              data-testid="view-toggle"
              onClick={toggleView}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
              title={viewMode === 'list' ? 'Switch to Grid' : 'Switch to List'}
            >
              {viewMode === 'list' ? <LayoutGrid size={13} /> : <ListIcon size={13} />}
            </button>
            <button 
              data-testid="search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-md transition-colors ${isSearchOpen ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-800'}`}
            >
              <Search size={13} />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="px-3 py-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        )}

        <div 
          data-testid="history-container"
          data-view={viewMode}
          className={`flex-1 overflow-y-auto py-2 custom-scrollbar ${
            viewMode === 'grid' ? 'grid grid-cols-2 gap-2 px-2' : 'space-y-0.5 px-1'
          }`}
        >
          {filteredItems.map((item) => (
            viewMode === 'list' 
              ? <HistoryListItem key={item.id} item={item} />
              : <HistoryGridItem key={item.id} item={item} />
          ))}
          {filteredItems.length === 0 && (
            <div className="text-sm text-gray-600 px-2 py-8 text-center italic">
              {searchQuery ? 'No matches found' : 'No recent sessions'}
            </div>
          )}
        </div>
      </div>

      {/* Creations Section */}
      <div className="px-4 py-2 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 py-3">
          <Package size={13} />
          <span>Creations</span>
        </div>
        <div className="grid grid-cols-4 gap-2 pb-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="aspect-square bg-gray-800/50 rounded-lg border border-white/5 flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 cursor-pointer transition-all active:scale-90" title="Saved Creation">
                <Box size={14} className="text-gray-600" />
             </div>
           ))}
           <div className="aspect-square bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all" title="View All Creations">
             <Plus size={14} className="text-gray-500" />
           </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors text-left">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
            ZS
          </div>
          <span className="flex-1 truncate">Zachary S.</span>
          <Settings size={14} className="text-gray-600" />
        </button>
      </div>
    </aside>
  );
};
