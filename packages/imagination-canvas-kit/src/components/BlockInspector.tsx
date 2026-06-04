// @ts-nocheck
import React from "react";
import { Settings, Save, Trash2, Sliders } from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";
import { useExpansionStore } from "../state/expansionStore";
import { PREDEFINED_AGENT_ROLES } from "@iem/core";

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
  const removeObject = useCanvasStore((s) => s.removeObject);
  const clearExpanded = useExpansionStore((s) => s.clearExpanded);
  const metadata = object.metadata || {};
  const inputs = metadata.inputs || {};

  const isAgent = object.type.includes("agent");

  const handleInputChange = (key: string, value: any) => {
    updateObject(object.id, {
      metadata: {
        inputs: {
          ...inputs,
          [key]: value,
        },
      },
    });
  };

  const handleMetadataChange = (key: string, value: any) => {
    updateObject(object.id, {
      metadata: {
        [key]: value,
      },
    });
  };

  const handleAgentRoleChange = (roleId: string) => {
    const updates: Record<string, any> = { roleId };
    if (roleId !== "custom") {
      const role = PREDEFINED_AGENT_ROLES.find((r) => r.id === roleId);
      if (role) {
        updates.role = role.label;
        updates.instructions = role.prompt;
      }
    } else {
      updates.role = metadata.role || "Custom Agent";
    }
    updateObject(object.id, {
      metadata: updates,
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
                value={metadata.label || ""}
                onChange={(e) => handleMetadataChange("label", e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-white/30 uppercase mb-1.5 ml-1">
                  Role Preset
                </p>
                {isAgent ? (
                  <select
                    value={metadata.roleId || "custom"}
                    onChange={(e) => handleAgentRoleChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors cursor-pointer"
                  >
                    <option value="custom">Custom</option>
                    {PREDEFINED_AGENT_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={metadata.role || ""}
                    onChange={(e) =>
                      handleMetadataChange("role", e.target.value)
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors"
                  />
                )}
              </div>

              {isAgent &&
                (metadata.roleId === "custom" || !metadata.roleId) && (
                  <div>
                    <p className="text-[9px] text-white/30 uppercase mb-1.5 ml-1">
                      Custom Role Name
                    </p>
                    <input
                      type="text"
                      value={metadata.role || ""}
                      onChange={(e) =>
                        handleMetadataChange("role", e.target.value)
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors"
                      placeholder="e.g., Space Explorer"
                    />
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* Dynamic Inputs */}
        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Parameters
          </label>
          <div className="space-y-4">
            {isAgent && (
              <div>
                <p className="text-[9px] text-white/30 uppercase mb-1.5 ml-1">
                  Instructions (System Prompt)
                </p>
                <textarea
                  value={metadata.instructions || ""}
                  onChange={(e) =>
                    handleMetadataChange("instructions", e.target.value)
                  }
                  disabled={!!metadata.roleId && metadata.roleId !== "custom"}
                  rows={4}
                  className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50 transition-colors custom-scrollbar ${
                    metadata.roleId && metadata.roleId !== "custom"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>
            )}
            {Object.keys(inputs).length === 0 && !isAgent ? (
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
        <button
          onClick={() => {
            removeObject(object.id);
            clearExpanded();
          }}
          className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
          title="Delete Block"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
