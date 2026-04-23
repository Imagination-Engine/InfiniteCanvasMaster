import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Group,
  Upload,
  Zap,
  Sparkles,
  X,
  Search,
  ChevronRight,
  Terminal,
  Plus,
} from "lucide-react";
import logo from "../assets/logo.svg";
import SaveCanvasButton from "../Components/SaveCanvasButton";
import type { UnifiedCanvasDocument } from "../nodes/canvasTypes";
import { NODE_CATALOG } from "../nodes/nodeCatalog";
import {
  getNodeIcon,
  PROVIDER_META,
  type ProviderKey,
} from "../nodes/nodeVisuals";
import type { BaseNodeData } from "../nodes/types";

type NodeLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (document: UnifiedCanvasDocument) => Promise<void> | void;
};

type GroupedNodes = Record<string, string[]>;

export default function NodeLibraryModal({
  isOpen,
  onClose,
  onSave,
}: NodeLibraryModalProps) {
  const [tab, setTab] = useState<
    "scribe" | "playable" | "atlas" | "reel" | "forge" | "workflow"
  >("scribe");
  const [searchQuery, setSearchQuery] = useState("");
  const [cliInput, setCliInput] = useState("");

  const creativeNodeTypes = useMemo(() => {
    return Object.keys(NODE_CATALOG).filter((type) => {
      const entry = NODE_CATALOG[type];
      return entry?.category === "creative" && type !== "fileUpload";
    });
  }, []);

  const filteredNodes = useMemo(() => {
    const nodes = creativeNodeTypes.filter((type) => type.startsWith(tab));
    if (!searchQuery) return nodes;
    return nodes.filter((type) =>
      NODE_CATALOG[type]?.defaultData.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [creativeNodeTypes, tab, searchQuery]);

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating new block via CLI:", cliInput);
    // In a real implementation, this would call a backend service to generate a new block definition
    setCliInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-[80vh] bg-brand-bg-surface/90 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col p-8">
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Registry
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {[
              { id: "scribe", label: "Scribe", icon: Sparkles },
              { id: "playable", label: "Playable", icon: Zap },
              { id: "atlas", label: "Atlas", icon: Group },
              { id: "reel", label: "Reel", icon: Search },
              { id: "forge", label: "Forge", icon: Terminal },
              { id: "workflow", label: "Workflow", icon: Plus },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  tab === item.id
                    ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                    : "text-brand-text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5">
            <SaveCanvasButton onSave={onSave} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="relative group flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-cyan transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search block types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
              />
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all text-brand-text-muted"
            >
              <X size={20} />
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNodes.map((type) => {
                const entry = NODE_CATALOG[type];
                const Icon = getNodeIcon(type);
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => onDragStart(e, type)}
                    className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all group/card cursor-grab active:cursor-grabbing relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple group-hover/card:scale-110 transition-transform">
                        <Icon size={18} />
                      </div>
                      <Plus
                        size={14}
                        className="text-white/10 group-hover/card:text-brand-purple transition-colors"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {entry?.defaultData.label}
                    </h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed line-clamp-2">
                      {entry?.defaultData.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergent CLI Footer */}
          <div className="p-8 bg-black/40 border-t border-white/5">
            <form
              onSubmit={handleCliSubmit}
              className="relative flex items-center group"
            >
              <div className="absolute left-4 flex items-center gap-2 text-brand-cyan/40">
                <Terminal size={14} />
                <span className="text-[10px] font-black tracking-tighter">
                  IEM:
                </span>
              </div>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Describe a new block concept to encode it dynamically..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-12 text-xs font-mono text-brand-cyan placeholder:text-white/10 focus:outline-none focus:border-brand-cyan/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 p-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded-lg transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
