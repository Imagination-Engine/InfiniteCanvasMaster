// @ts-nocheck
import React from "react";
import { Settings, Save, Trash2, Sliders } from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";

interface BlockInspectorProps {
  object: any;
  onClose?: () => void;
}

/**
 * Standardized block configuration interface for the immersive modal sidebar.
 */
export const BlockInspector: React.FC<BlockInspectorProps> = ({
  object,
  onClose,
}) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const inputs = object.metadata?.inputs || {};

  const handleInputChange = (key: string, value: any) => {
    updateObject(object.id, {
      metadata: {
        ...object.metadata,
        inputs: {
          ...inputs,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg-surface/50">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-brand-cyan" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Config: {object.type.split(".").pop()}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6 custom-scrollbar">
        {/* Basic Metadata */}
        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Identity
          </label>
          <div className="space-y-4">
            <div>
              <p className="text-[9px] text-white/30 uppercase mb-1.5 ml-1">
                Label
              </p>
              <input
                type="text"
                value={object.metadata?.label || ""}
                onChange={(e) =>
                  updateObject(object.id, {
                    metadata: { ...object.metadata, label: e.target.value },
                  })
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors"
              />
            </div>
            <div>
              <p className="text-[9px] text-white/30 uppercase mb-1.5 ml-1">
                Role
              </p>
              <input
                type="text"
                value={object.metadata?.role || ""}
                onChange={(e) =>
                  updateObject(object.id, {
                    metadata: { ...object.metadata, role: e.target.value },
                  })
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Dynamic Inputs */}
        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Parameters
          </label>
          <div className="space-y-4">
            {Object.keys(inputs).length === 0 ? (
              <p className="text-[10px] text-white/20 italic p-4 bg-white/5 rounded-lg border border-dashed border-white/10 text-center">
                No configurable inputs found.
              </p>
            ) : (
              Object.entries(inputs).map(([key, value]) => (
                <div key={key}>
                  <p className="text-[9px] text-white/30 uppercase mb-1.5 ml-1">
                    {key}
                  </p>
                  {typeof value === "boolean" ? (
                    <button
                      onClick={() => handleInputChange(key, !value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${value ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "bg-black/40 border-white/10 text-white/40"}`}
                    >
                      <span className="text-[10px] font-bold uppercase">
                        {value ? "Enabled" : "Disabled"}
                      </span>
                      <Sliders size={12} />
                    </button>
                  ) : (
                    <textarea
                      value={String(value)}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors custom-scrollbar"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-cyan text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand-cyan/20">
          <Save size={14} />
          Sync Changes
        </button>
        <button className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
