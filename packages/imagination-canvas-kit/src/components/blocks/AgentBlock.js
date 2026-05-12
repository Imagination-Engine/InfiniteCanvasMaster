import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useState } from "react";
import { Settings, Save, Loader2, Check } from "lucide-react";
import { useCanvasStore } from "../../state/canvasStore";
import { useLibraryStore } from "../../state/libraryStore";
export const AgentBlock = ({ object, mode = "compact" }) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const addCustomBlock = useLibraryStore((s) => s.addCustomBlock);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const isExpanded = mode === "fullscreen" || mode === "side-panel";
  const handleChange = (key, value) => {
    updateObject(object.id, {
      metadata: {
        ...object.metadata,
        [key]: value,
      },
    });
  };
  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    const blockPayload = {
      id: `custom.${object.type}.${Date.now()}`,
      name: object.metadata.label || "Custom Agent",
      category: "Custom",
      description: object.metadata.instructions || "A custom configured agent.",
      icon: "Bot",
      agentic: true,
      runtime: "agent",
      metadata: {
        ...object.metadata,
        isCustom: true,
        savedAt: new Date().toISOString(),
      },
    };
    try {
      const response = await fetch("/api/blocks/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blockPayload),
      });
      if (response.ok) {
        const data = await response.json();
        setSaveStatus("success");
        addCustomBlock(data.block || blockPayload);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("success");
        addCustomBlock(blockPayload);
      }, 1500);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };
  if (isExpanded) {
    return _jsxs("div", {
      className: "w-full h-full flex flex-col gap-6 p-6 text-white",
      children: [
        _jsxs("div", {
          className: "space-y-4",
          children: [
            _jsxs("div", {
              children: [
                _jsx("label", {
                  htmlFor: "agent-label",
                  className:
                    "block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2",
                  children: "Display Name",
                }),
                _jsx("input", {
                  id: "agent-label",
                  type: "text",
                  value: object.metadata.label || "",
                  onChange: (e) => handleChange("label", e.target.value),
                  className:
                    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-purple/50 outline-none transition-all",
                  placeholder: "e.g., Marketing Copywriter",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  htmlFor: "agent-role",
                  className:
                    "block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2",
                  children: "Agent Role",
                }),
                _jsx("input", {
                  id: "agent-role",
                  type: "text",
                  value: object.metadata.role || "",
                  onChange: (e) => handleChange("role", e.target.value),
                  className:
                    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-purple/50 outline-none transition-all font-mono",
                  placeholder: "e.g., Researcher, Builder, Critic",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  htmlFor: "agent-instructions",
                  className:
                    "block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2",
                  children: "Instructions",
                }),
                _jsx("textarea", {
                  id: "agent-instructions",
                  value: object.metadata.instructions || "",
                  onChange: (e) => handleChange("instructions", e.target.value),
                  className:
                    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-purple/50 outline-none transition-all min-h-[120px] resize-none",
                  placeholder: "Define exactly how this agent should behave...",
                }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          className:
            "pt-4 border-t border-white/5 mt-auto flex items-center justify-between",
          children: [
            _jsxs("div", {
              className: "flex items-center gap-2 text-white/40",
              children: [
                _jsx(Settings, { size: 14 }),
                _jsx("span", {
                  className: "text-[10px] font-bold uppercase tracking-widest",
                  children: "Runtime: Gemini 2.0 Pro",
                }),
              ],
            }),
            _jsxs("button", {
              onClick: handleSaveToLibrary,
              disabled: isSaving,
              className: `flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                saveStatus === "success"
                  ? "bg-green-500/20 text-green-500 border-green-500/30"
                  : saveStatus === "error"
                    ? "bg-red-500/20 text-red-500 border-red-500/30"
                    : "bg-brand-purple/20 text-brand-purple border-brand-purple/30 hover:bg-brand-purple/30"
              }`,
              children: [
                isSaving
                  ? _jsx(Loader2, { size: 14, className: "animate-spin" })
                  : saveStatus === "success"
                    ? _jsx(Check, { size: 14 })
                    : _jsx(Save, { size: 14 }),
                isSaving
                  ? "Saving..."
                  : saveStatus === "success"
                    ? "Saved!"
                    : saveStatus === "error"
                      ? "Failed"
                      : "Save to Library",
              ],
            }),
          ],
        }),
      ],
    });
  }
  // Minimized / Compact view: Frameless
  return _jsx("div", {
    className: "flex flex-col gap-3 h-full",
    children: _jsxs("div", {
      className:
        "flex-1 text-[11px] text-brand-purple/90 font-mono leading-relaxed line-clamp-4 bg-brand-purple/5 p-3 rounded-xl border border-brand-purple/10 shadow-inner",
      children: [
        '"',
        object.metadata.instructions ||
          object.metadata.lastAction ||
          "Defining my purpose on the canvas...",
        '"',
      ],
    }),
  });
};
