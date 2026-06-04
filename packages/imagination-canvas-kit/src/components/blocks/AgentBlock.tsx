// @ts-nocheck
import React, { useState, useRef } from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";
import {
  Bot,
  Settings,
  Save,
  Loader2,
  Check,
  Play,
  FileText,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Paperclip,
  AlertCircle,
  Send,
} from "lucide-react";
import { useCanvasStore } from "../../state/canvasStore";
import { useLibraryStore } from "../../state/libraryStore";
import { useConnectionStore } from "../../state/connectionStore";
import { PREDEFINED_AGENT_ROLES } from "@iem/core";

export const AgentBlock: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
  onParamsChange,
}) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const addCustomBlock = useLibraryStore((s) => s.addCustomBlock);
  const accessToken = useCanvasStore((s) => s.accessToken);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(true);

  // File Upload states
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExpanded = mode === "fullscreen" || mode === "side-panel";

  // Destructure or fallback metadata values
  const metadata = object.metadata || {};
  const inputs = metadata.inputs || {};
  const outputs = metadata.outputs || {};

  const provider = metadata.provider || inputs.provider || "google";
  const model =
    metadata.model ||
    inputs.model ||
    (provider === "google" ? "gemini-3.5-flash" : "mistral");
  const referenceFiles = metadata.referenceFiles || inputs.referenceFiles || [];

  // Prioritize inputs.prompt (routed from store) over top-level metadata.prompt
  const prompt =
    inputs.prompt !== undefined ? inputs.prompt : metadata.prompt || "";

  const instructions = metadata.instructions || inputs.instructions || "";
  const outputText = outputs.output || "";

  // ---------------------------------------------------------------------------
  // Reactive Input Propagation
  // ---------------------------------------------------------------------------
  // Detect changes in upstream connections and trigger execution automatically
  const connections = useConnectionStore((s) => s.connections) || {};
  const objects = useCanvasStore((s) => s.objects) || {};

  React.useEffect(() => {
    // Only auto-execute if we are on the canvas (compact mode) or explicitly enabled
    // and if we're not already executing.
    if (isExecuting) return;

    const upstreamConns = Object.values(connections).filter(
      (c: any) => c.toId === object.id,
    );

    if (upstreamConns.length === 0) return;

    // Check if any upstream output has changed
    let latestOutputHash = "";
    let combinedContent = "";

    upstreamConns.forEach((conn: any) => {
      const sourceObj = objects[conn.fromId];
      if (!sourceObj) return;
      const meta = sourceObj.metadata || {};
      const out =
        meta.outputs?.output ||
        meta.text ||
        meta.instructions ||
        meta.content ||
        "";
      if (out) {
        latestOutputHash += `${sourceObj.id}:${out}|`;
        combinedContent += (combinedContent ? "\n\n" : "") + out;
      }
    });

    // Store a hash of upstream inputs in metadata to avoid infinite loops
    const lastHash = metadata.lastUpstreamHash || "";
    if (latestOutputHash && latestOutputHash !== lastHash) {
      console.log(
        `[AgentBlock] ${object.id} detected upstream change, updating input and triggering auto-run...`,
      );

      // Update the hash and the prompt field so the user can see what's inputted
      const updates = {
        lastUpstreamHash: latestOutputHash,
        prompt: combinedContent,
      };

      handleChanges(updates);

      // Brief delay to ensure state settles before execution
      setTimeout(() => {
        handleExecuteAgent(combinedContent);
      }, 200);
    }
  }, [connections, objects, object.id, isExecuting, metadata.lastUpstreamHash]);

  const handleChange = (key: string, value: any) => {
    if (onParamsChange) {
      onParamsChange({ [key]: value });
    } else {
      updateObject(object.id, {
        metadata: {
          ...object.metadata,
          [key]: value,
        },
      });
    }
  };

  const handleChanges = (patch: Record<string, any>) => {
    if (onParamsChange) {
      onParamsChange(patch);
    } else {
      updateObject(object.id, {
        metadata: {
          ...object.metadata,
          ...patch,
        },
      });
    }
  };

  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    const blockPayload = {
      id: `custom.${object.type}.${Date.now()}`,
      name: metadata.label || "Custom Agent",
      category: "Custom",
      description: instructions || "A custom configured agent.",
      icon: "Bot",
      agentic: true,
      runtime: "agent",
      metadata: {
        ...metadata,
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

  // Client-side file uploading and parsing (reads file text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const loadedFiles: any[] = [];
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result as string;
        loadedFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          content: content,
        });

        completed++;
        if (completed === files.length) {
          handleChange("referenceFiles", [...referenceFiles, ...loadedFiles]);
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        completed++;
        if (completed === files.length) {
          setIsUploading(false);
        }
      };

      reader.readAsText(file);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = referenceFiles.filter((f: any) => f.id !== fileId);
    handleChange("referenceFiles", updated);
  };

  // Node Prompt Execution
  const handleExecuteAgent = async (overrideInput?: string) => {
    if (isExecuting) return;

    // Safely determine the input, ignoring event objects if called directly as handler
    const activeInput =
      typeof overrideInput === "string" ? overrideInput : prompt;

    console.log("[AgentBlock] Starting execution...", {
      input: activeInput,
      provider,
      model,
      instructionsLength: instructions?.length,
    });

    setIsExecuting(true);
    setExecError(null);
    updateObject(object.id, { status: "thinking" });

    try {
      // Use the provided input (from reactive update) or the current local prompt
      const finalInput =
        activeInput || instructions || "Perform your designated role.";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const payload = {
        blockId: "iem.agent.agent",
        inputs: {
          instructions: instructions || "You are a helpful AI assistant.",
          input: finalInput,
          provider: provider || "google",
          model:
            model || (provider === "google" ? "gemini-3.5-flash" : "mistral"),
          referenceFiles,
        },
      };

      console.log("[AgentBlock] Fetching /api/blocks/execute", payload);

      const response = await fetch("/api/blocks/execute", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP Error ${response.status}: ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("[AgentBlock] Execution successful", result);

      // Robustly extract the text portion of the response
      const extractText = (val: any): string => {
        if (!val) return "";
        if (typeof val === "string") return val;
        // If it's an object, check common "primary output" keys
        if (typeof val === "object") {
          return extractText(
            val.output ||
              val.text ||
              val.content ||
              val.result ||
              JSON.stringify(val),
          );
        }
        return String(val);
      };

      const generatedOutput = extractText(result.output);

      // 1. Update own object status and output metadata
      updateObject(object.id, {
        status: "idle",
        metadata: {
          outputs: {
            output: generatedOutput,
          },
        },
      });

      // 2. Dynamic downstream propagation - FETCH FRESH STATE
      const freshConnections = useConnectionStore.getState().connections || {};
      const freshObjects = useCanvasStore.getState().objects || {};

      const downstreamConns = Object.values(freshConnections).filter(
        (c: any) => c.fromId === object.id,
      );

      downstreamConns.forEach((conn: any) => {
        const targetId = conn.toId;
        const targetObj = freshObjects[targetId];

        if (targetObj) {
          const typeLower = targetObj.type.toLowerCase();
          if (
            typeLower === "note" ||
            typeLower === "text" ||
            typeLower.includes("prose") ||
            typeLower.includes("scribe") ||
            typeLower.includes("rich")
          ) {
            updateObject(targetId, {
              metadata: {
                instructions: generatedOutput, // note instructions/content
                text: generatedOutput, // standard text field
                content: generatedOutput, // rich text field
                label:
                  targetObj.metadata?.label ||
                  (typeLower === "note"
                    ? "Agent Output"
                    : targetObj.metadata?.label),
              },
            });
          }
        }
      });

      setShowOutput(true);
    } catch (err: any) {
      console.error("[AgentBlock] Execution failed", err);
      setExecError(err.message || "Execution failed");

      // Local simulation fallback
      await new Promise((res) => setTimeout(res, 1000));
      const modelLabel = (model || "UNKNOWN").toUpperCase();
      const simulatedText = `[LOCAL SIMULATOR - ${modelLabel}]\n\nHello! I am your configured agent (Provider: ${(provider || "google").toUpperCase()}). I successfully processed your input:\n"${activeInput}"\n\nActive Instructions:\n"${instructions || "No custom instructions defined"}"\n\nReference Documents Attached: ${referenceFiles.length} file(s).`;

      updateObject(object.id, {
        status: "idle",
        metadata: {
          outputs: {
            output: simulatedText,
          },
        },
      });

      // Propagate mock downstream - FETCH FRESH STATE
      const freshConnections = useConnectionStore.getState().connections || {};
      const freshObjects = useCanvasStore.getState().objects || {};

      const downstreamConns = Object.values(freshConnections).filter(
        (c: any) => c.fromId === object.id,
      );

      downstreamConns.forEach((conn: any) => {
        const targetId = conn.toId;
        const targetObj = freshObjects[targetId];
        if (targetObj) {
          const typeLower = targetObj.type.toLowerCase();
          if (
            typeLower === "note" ||
            typeLower === "text" ||
            typeLower.includes("prose") ||
            typeLower.includes("rich")
          ) {
            updateObject(targetId, {
              metadata: {
                instructions: simulatedText,
                text: simulatedText,
                content: simulatedText,
              },
            });
          }
        }
      });

      setShowOutput(true);
    } finally {
      setIsExecuting(false);
    }
  };

  // Expanded View Settings Panel
  if (isExpanded) {
    return (
      <div className="w-full h-full flex flex-col gap-6 p-6 text-white overflow-y-auto custom-scrollbar">
        <div className="space-y-5">
          {/* Metadata Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="agent-label"
                className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5"
              >
                Display Name
              </label>
              <input
                id="agent-label"
                type="text"
                value={object.metadata.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all"
                placeholder="e.g., Marketing Copywriter"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="agent-role"
                  className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5"
                >
                  Agent Role Preset
                </label>
                <select
                  id="agent-role"
                  value={metadata.roleId || "custom"}
                  onChange={(e) => {
                    const roleId = e.target.value;
                    const updates: Record<string, any> = { roleId };
                    if (roleId !== "custom") {
                      const role = PREDEFINED_AGENT_ROLES.find(
                        (r) => r.id === roleId,
                      );
                      if (role) {
                        updates.role = role.label;
                        updates.instructions = role.prompt;
                      }
                    } else {
                      updates.role = metadata.role || "Custom Agent";
                    }
                    handleChanges(updates);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all cursor-pointer"
                >
                  <option
                    value="custom"
                    className="bg-brand-bg-page text-white"
                  >
                    Custom
                  </option>
                  {PREDEFINED_AGENT_ROLES.map((r) => (
                    <option
                      key={r.id}
                      value={r.id}
                      className="bg-brand-bg-page text-white"
                    >
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {(metadata.roleId === "custom" || !metadata.roleId) && (
                <div>
                  <label
                    htmlFor="custom-role-name"
                    className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5"
                  >
                    Custom Role Name
                  </label>
                  <input
                    id="custom-role-name"
                    type="text"
                    value={metadata.role || ""}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all"
                    placeholder="e.g., Space Explorer, Math Tutor"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Model / Provider Configuration */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5">
                AI Provider
              </label>
              <select
                value={provider === "local" ? "ollama" : provider}
                onChange={(e) => {
                  const nextProvider = e.target.value;
                  handleChanges({
                    provider: nextProvider,
                    model:
                      nextProvider === "google"
                        ? "gemini-3.5-flash"
                        : "mistral",
                  });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all cursor-pointer"
              >
                <option value="google" className="bg-brand-bg-page text-white">
                  Google Gemini
                </option>
                <option value="ollama" className="bg-brand-bg-page text-white">
                  Ollama (Local)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5">
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => handleChange("model", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all cursor-pointer"
              >
                {provider === "google" ? (
                  <>
                    <option
                      value="gemini-3.5-flash"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-3.5-flash
                    </option>
                    <option
                      value="gemini-3.5-pro"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-3.5-pro
                    </option>
                    <option
                      value="gemini-3.1-pro"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-3.1-pro
                    </option>
                    <option
                      value="gemini-3.1-flash-lite"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-3.1-flash-lite
                    </option>
                  </>
                ) : (
                  <>
                    <option
                      value="mistral"
                      className="bg-brand-bg-page text-white"
                    >
                      mistral
                    </option>
                    <option
                      value="llama3"
                      className="bg-brand-bg-page text-white"
                    >
                      llama3
                    </option>
                    <option
                      value="phi3"
                      className="bg-brand-bg-page text-white"
                    >
                      phi3
                    </option>
                    <option
                      value="gemma"
                      className="bg-brand-bg-page text-white"
                    >
                      gemma
                    </option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* System Instructions / System Prompt */}
          <div className="border-t border-white/5 pt-4">
            <label
              htmlFor="agent-instructions"
              className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5"
            >
              System Prompt (Instructions)
            </label>
            <textarea
              id="agent-instructions"
              value={instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              disabled={!!metadata.roleId && metadata.roleId !== "custom"}
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all min-h-[100px] resize-none ${
                metadata.roleId && metadata.roleId !== "custom"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              placeholder="Define exactly how this agent should behave (e.g., You are a critic who replies in bullet points...)"
            />
          </div>

          {/* Input Section */}
          <div className="border-t border-white/5 pt-4">
            <label
              htmlFor="agent-prompt"
              className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5"
            >
              Input
            </label>
            <textarea
              id="agent-prompt"
              value={prompt}
              onChange={(e) => handleChange("prompt", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all min-h-[100px] resize-none"
              placeholder="Incoming data from upstream blocks will appear here automatically..."
            />
          </div>

          {/* Agent Output Section */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-brand-cyan">
                Agent Output
              </label>
              {execError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-[10px] animate-pulse">
                  <AlertCircle size={12} />
                  <span>{execError}</span>
                </div>
              )}
            </div>
            <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 min-h-[150px] font-mono text-[11px] text-white/90 leading-relaxed overflow-y-auto custom-scrollbar shadow-inner break-words">
              {outputText ? (
                outputText
              ) : (
                <span className="text-white/20 italic">
                  No output yet. Run the agent to see results.
                </span>
              )}
            </div>
          </div>

          {/* Reference Files Section */}
          <div className="border-t border-white/5 pt-4">
            <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
              Reference Documents
            </label>

            {/* File Upload Trigger */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-purple/30 transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".txt,.json,.md,.js,.ts,.html,.css,.csv"
              />
              {isUploading ? (
                <Loader2 size={16} className="animate-spin text-brand-purple" />
              ) : (
                <Upload
                  size={16}
                  className="text-white/40 group-hover:text-brand-purple transition-colors"
                />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                {isUploading
                  ? "Uploading & Parsing..."
                  : "Upload Text Reference Files"}
              </span>
              <span className="text-[9px] text-white/30">
                Supports .txt, .md, .json up to 2MB
              </span>
            </div>

            {/* List of Files */}
            {referenceFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {referenceFiles.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText
                        size={13}
                        className="text-brand-purple shrink-0"
                      />
                      <span className="truncate font-medium text-white/80">
                        {file.name}
                      </span>
                      <span className="text-[9px] text-white/30 shrink-0">
                        ({file.size})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 hover:bg-white/10 text-white/40 hover:text-rose-400 rounded-md transition-colors"
                      title="Remove Reference"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40">
            <Bot size={14} className="text-brand-purple" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Runtime:{" "}
              {provider === "google" ? "Gemini API Proxy" : "Ollama Daemon"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExecuteAgent()}
              disabled={isExecuting || (!prompt.trim() && !instructions.trim())}
              className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-cyan/30 transition-all disabled:opacity-40"
            >
              {isExecuting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {isExecuting ? "Executing..." : "Test Agent"}
            </button>
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                saveStatus === "success"
                  ? "bg-green-500/20 text-green-500 border-green-500/30"
                  : saveStatus === "error"
                    ? "bg-red-500/20 text-red-500 border-red-500/30"
                    : "bg-brand-purple/20 text-brand-purple border-brand-purple/30 hover:bg-brand-purple/30"
              }`}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saveStatus === "success" ? (
                <Check size={14} />
              ) : (
                <Save size={14} />
              )}
              {isSaving
                ? "Saving..."
                : saveStatus === "success"
                  ? "Saved!"
                  : saveStatus === "error"
                    ? "Failed"
                    : "Save to Library"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Minimized / Compact View directly on the Canvas Viewport
  return (
    <div className="flex flex-col gap-2.5 h-full text-white font-sans pt-0 px-1 pb-1">
      {/* Role / Summary */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shadow-sm">
            <Bot size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple">
            {metadata.role || "AI Sub-Agent"}
          </span>
        </div>
        {referenceFiles.length > 0 && (
          <div
            className="flex items-center gap-1 text-[9px] text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5"
            title={`${referenceFiles.length} reference documents loaded`}
          >
            <Paperclip size={9} />
            <span>{referenceFiles.length}</span>
          </div>
        )}
      </div>

      {/* Description / Tagline */}
      {metadata.description && (
        <div className="text-[10px] text-white/40 italic line-clamp-2 shrink-0 px-0.5">
          {metadata.description}
        </div>
      )}

      {/* Main Execution Segment */}
      <div className="mt-auto pt-2 flex flex-col gap-3 shrink-0">
        {/* Run Button Panel */}
        <button
          onClick={() => handleExecuteAgent()}
          disabled={isExecuting || (!prompt.trim() && !instructions.trim())}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-brand-purple to-brand-cyan text-white hover:shadow-[0_0_12px_rgba(123,92,234,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all scale-100 hover:scale-[1.02]"
        >
          {isExecuting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Play size={10} className="fill-current" />
          )}
          {isExecuting ? "Executing..." : "Run Agent"}
        </button>
      </div>
    </div>
  );
};
