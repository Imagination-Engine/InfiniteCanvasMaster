import { useMemo, useState, type DragEvent } from "react";
import {
  Group,
  Zap,
  Sparkles,
  X,
  Search,
  ChevronRight,
  Terminal,
  Plus,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.svg";
import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { getNodeIcon } from "../nodes/nodeVisuals";

type NodeLibraryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NodeLibraryDrawer({
  isOpen,
  onClose,
}: NodeLibraryDrawerProps) {
  const [tab, setTab] = useState<
    "scribe" | "playable" | "atlas" | "reel" | "forge" | "workflow"
  >("scribe");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-[101] h-full w-[400px] bg-brand-bg-surface/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-purple/20 flex items-center justify-center">
                  <LayoutGrid size={18} className="text-brand-purple" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Block Registry
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-all text-brand-text-muted"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-4 py-2 gap-1 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
              {[
                { id: "scribe", label: "Scribe", icon: Sparkles },
                { id: "playable", label: "Play", icon: Zap },
                { id: "atlas", label: "Atlas", icon: Group },
                { id: "reel", label: "Reel", icon: Search },
                { id: "forge", label: "Forge", icon: Terminal },
                { id: "workflow", label: "Flow", icon: Plus },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    tab === item.id
                      ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                      : "text-brand-text-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={12} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/5">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-cyan transition-colors"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Filter blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-3">
                {filteredNodes.map((type) => {
                  const entry = NODE_CATALOG[type];
                  const Icon = getNodeIcon(type);
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => onDragStart(e, type)}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all group/card cursor-grab active:cursor-grabbing relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple group-hover/card:scale-110 transition-transform flex-shrink-0">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white mb-1 truncate">
                            {entry?.defaultData.label}
                          </h4>
                          <p className="text-[10px] text-brand-text-muted leading-relaxed line-clamp-2">
                            {entry?.defaultData.description}
                          </p>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Plus size={12} className="text-brand-purple" />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-tighter text-white/40">
                          Drag to Canvas
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Tip */}
            <div className="p-6 bg-black/40 border-t border-white/5">
              <p className="text-[10px] text-brand-text-muted italic leading-relaxed text-center">
                "Drag any block onto the spatial substrate to extend your neural
                architecture."
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
