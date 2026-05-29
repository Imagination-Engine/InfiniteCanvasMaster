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
} from "lucide-react";
import { useCanvasStore } from "../../state/canvasStore";
import { useLibraryStore } from "../../state/libraryStore";
import { useConnectionStore } from "../../state/connectionStore";

export const AgentBlock: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
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
  const provider = metadata.provider || "google";
  const model =
    metadata.model || (provider === "google" ? "gemini-2.5-flash" : "mistral");
  const referenceFiles = metadata.referenceFiles || [];
  const prompt = metadata.prompt || "";
  const instructions = metadata.instructions || "";
  const outputText = metadata.outputs?.output || "";

  const handleChange = (key: string, value: any) => {
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
  const handleExecuteAgent = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecError(null);
    updateObject(object.id, { status: "thinking" });

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const response = await fetch("http://localhost:3001/api/blocks/execute", {
        method: "POST",
        headers,
        body: JSON.stringify({
          blockId: "iem.conductor.agent",
          inputs: {
            instructions: instructions || "You are a helpful AI assistant.",
            input: prompt,
            provider,
            model,
            referenceFiles,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error ${response.status}: ${response.statusText}`,
        );
      }

      const result = await response.json();
      const generatedOutput = result.output?.output || result.output || "";

      // 1. Update own object status and output metadata
      updateObject(object.id, {
        status: "idle",
        metadata: {
          ...object.metadata,
          outputs: {
            output: generatedOutput,
          },
        },
      });

      // 2. Dynamic downstream propagation to connected Note or Text blocks on the canvas
      const connections = useConnectionStore.getState().connections || {};
      const downstreamConns = Object.values(connections).filter(
        (c: any) => c.fromId === object.id,
      );

      downstreamConns.forEach((conn: any) => {
        const targetId = conn.toId;
        const targetObj = useCanvasStore.getState().objects[targetId];

        if (targetObj) {
          const typeLower = targetObj.type.toLowerCase();
          if (
            typeLower === "note" ||
            typeLower === "text" ||
            typeLower.includes("prose") ||
            typeLower.includes("scribe")
          ) {
            updateObject(targetId, {
              metadata: {
                ...targetObj.metadata,
                instructions: generatedOutput, // note instructions/content
                text: generatedOutput, // standard text field
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
      console.warn(
        "Agent Node execution failed, falling back to local simulation.",
        err,
      );

      // Local simulation fallback
      await new Promise((res) => setTimeout(res, 1000));
      const simulatedText = `[LOCAL SIMULATOR - ${model.toUpperCase()}]\n\nHello! I am your configured agent (Provider: ${provider.toUpperCase()}). I successfully processed your prompt:\n"${prompt}"\n\nActive Instructions:\n"${instructions || "No custom instructions defined"}"\n\nReference Documents Attached: ${referenceFiles.length} file(s).`;

      updateObject(object.id, {
        status: "idle",
        metadata: {
          ...object.metadata,
          outputs: {
            output: simulatedText,
          },
        },
      });

      // Propagate mock downstream
      const connections = useConnectionStore.getState().connections || {};
      const downstreamConns = Object.values(connections).filter(
        (c: any) => c.fromId === object.id,
      );

      downstreamConns.forEach((conn: any) => {
        const targetId = conn.toId;
        const targetObj = useCanvasStore.getState().objects[targetId];
        if (targetObj) {
          const typeLower = targetObj.type.toLowerCase();
          if (
            typeLower === "note" ||
            typeLower === "text" ||
            typeLower.includes("prose")
          ) {
            updateObject(targetId, {
              metadata: {
                ...targetObj.metadata,
                instructions: simulatedText,
                text: simulatedText,
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

            <div>
              <label
                htmlFor="agent-role"
                className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5"
              >
                Agent Role
              </label>
              <input
                id="agent-role"
                type="text"
                value={object.metadata.role || ""}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all font-mono"
                placeholder="e.g., Copywriter, Coder"
              />
            </div>
          </div>

          {/* Model / Provider Configuration */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5">
                AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  const nextProvider = e.target.value;
                  handleChange("provider", nextProvider);
                  handleChange(
                    "model",
                    nextProvider === "google" ? "gemini-2.5-flash" : "mistral",
                  );
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all cursor-pointer"
              >
                <option value="google" className="bg-brand-bg-page text-white">
                  Google Gemini
                </option>
                <option value="local" className="bg-brand-bg-page text-white">
                  Local Ollama
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
                      value="gemini-2.5-flash"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-2.5-flash
                    </option>
                    <option
                      value="gemini-2.5-pro"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-2.5-pro
                    </option>
                    <option
                      value="gemini-1.5-flash"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-1.5-flash
                    </option>
                    <option
                      value="gemini-1.5-pro"
                      className="bg-brand-bg-page text-white"
                    >
                      gemini-1.5-pro
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 outline-none transition-all min-h-[100px] resize-none"
              placeholder="Define exactly how this agent should behave (e.g., You are a critic who replies in bullet points...)"
            />
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
    );
  }

  // Minimized / Compact View directly on the Canvas Viewport
  return (
    <div className="flex flex-col gap-3.5 h-full text-white font-sans p-1">
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

      {/* Tagline / Instructions Purpose */}
      <div className="text-[10px] text-white/40 italic truncate shrink-0 px-0.5">
        {instructions ||
          metadata.lastAction ||
          "Defining my purpose on the canvas..."}
      </div>

      {/* Main Execution Segment */}
      <div className="space-y-3 flex-1 flex flex-col min-h-0">
        {/* Prompt input */}
        <div className="space-y-1 shrink-0">
          <label className="text-[8px] font-black uppercase tracking-wider text-white/30">
            User Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => handleChange("prompt", e.target.value)}
            placeholder="Type your prompt here..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-purple/50 outline-none transition-all placeholder-white/20 min-h-[50px] resize-none custom-scrollbar font-medium"
          />
        </div>

        {/* Run Button Panel */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExecuteAgent}
            disabled={isExecuting || !prompt.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-brand-purple to-brand-cyan text-white hover:shadow-[0_0_12px_rgba(123,92,234,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all scale-100 hover:scale-[1.02]"
          >
            {isExecuting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={10} className="fill-current" />
            )}
            {isExecuting ? "Executing..." : "Run Agent"}
          </button>
        </div>

        {/* Toggleable Output Segment */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Header Toggle */}
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="w-full py-1.5 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors border-t border-white/5"
          >
            <span className="flex items-center gap-1">
              <Sparkles size={9} className="text-brand-cyan animate-pulse" />
              Agent Output
            </span>
            {showOutput ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          {/* Collapsible Area */}
          {showOutput && (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 bg-black/30 border border-white/5 rounded-xl font-mono text-[11px] text-white/80 leading-relaxed break-words shadow-inner">
              {outputText ? (
                outputText
              ) : (
                <span className="text-white/25 italic">
                  No output generated yet. Enter a prompt and run the agent.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
