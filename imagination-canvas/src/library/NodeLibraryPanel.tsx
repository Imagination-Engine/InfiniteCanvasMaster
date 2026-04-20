import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Group, Upload, Zap, Sparkles } from "lucide-react";
import logo from "../assets/logo.svg";
import SaveCanvasButton from "../Components/SaveCanvasButton";
import type { UnifiedCanvasDocument } from "../nodes/canvasTypes";
import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { getNodeIcon, PROVIDER_META, type ProviderKey } from "../nodes/nodeVisuals";
import type { BaseNodeData } from "../nodes/types";

type NodeLibraryPanelProps = {
  onSave?: (document: UnifiedCanvasDocument) => Promise<void> | void;
};

type GroupedNodes = Record<string, string[]>;

type UploadedNodeDraft = {
  id: string;
  nodeType: "fileUpload";
  dataPreset: Partial<BaseNodeData>;
};

const providerOrder: ProviderKey[] = ["zoom", "discord", "slack", "trello", "calendly", "gmail", "sheets"];

const readFileAsText = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Failed to read file."));
  reader.onload = () => resolve(String(reader.result ?? ""));
  reader.readAsText(file);
});

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Failed to read file."));
  reader.onload = () => resolve(String(reader.result ?? ""));
  reader.readAsDataURL(file);
});

export default function NodeLibraryPanel({ onSave }: NodeLibraryPanelProps) {
  const [tab, setTab] = useState<"creative" | "workflow">("creative");
  const [uploadedNodes, setUploadedNodes] = useState<UploadedNodeDraft[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creativeNodeTypes = useMemo(
    () => Object.keys(NODE_CATALOG).filter((type) => NODE_CATALOG[type]?.category === "creative" && type !== "fileUpload"),
    [],
  );

  const workflowNodeTypes = useMemo(
    () => Object.keys(NODE_CATALOG).filter((type) => NODE_CATALOG[type]?.category === "workflow"),
    [],
  );

  const triggerNodeTypes = useMemo(
    () => workflowNodeTypes.filter((type) => NODE_CATALOG[type]?.role === "trigger"),
    [workflowNodeTypes],
  );

  const actionGroups = useMemo(() => {
    const grouped: GroupedNodes = {};
    for (const nodeType of workflowNodeTypes) {
      if (NODE_CATALOG[nodeType]?.role !== "action") {
        continue;
      }

      const provider = nodeType.split(".")[0] ?? "other";
      if (!grouped[provider]) {
        grouped[provider] = [];
      }
      grouped[provider].push(nodeType);
    }
    return grouped;
  }, [workflowNodeTypes]);

  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
    dataPreset?: Partial<BaseNodeData>,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);

    if (dataPreset) {
      event.dataTransfer.setData(
        "application/reactflow-node",
        JSON.stringify({
          nodeType,
          data: dataPreset,
        }),
      );
    }

    event.dataTransfer.effectAllowed = "move";
  };

  const createUploadDraft = async (file: File): Promise<UploadedNodeDraft> => {
    const nodeId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const mimeType = file.type || "application/octet-stream";

    const outputs: Record<string, unknown> = {
      file: {
        name: file.name,
        size: file.size,
        type: mimeType,
      },
    };

    if (mimeType.startsWith("image/")) {
      const imageDataUrl = await readFileAsDataUrl(file);
      outputs.image = imageDataUrl;
      outputs.text = "";
      outputs.json = null;
    } else if (mimeType.startsWith("audio/")) {
      const audioDataUrl = await readFileAsDataUrl(file);
      outputs.audio = audioDataUrl;
      outputs.text = "";
      outputs.json = null;
    } else {
      const text = await readFileAsText(file);
      outputs.text = text;
      if (mimeType.includes("json") || file.name.toLowerCase().endsWith(".json")) {
        try {
          outputs.json = JSON.parse(text);
        } catch {
          outputs.json = null;
        }
      }
    }

    return {
      id: nodeId,
      nodeType: "fileUpload",
      dataPreset: {
        label: `Upload: ${file.name}`,
        description: "Uploaded file payload node.",
        inputs: {
          fileName: file.name,
          mimeType,
        },
        outputs,
      },
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const drafts = await Promise.all(files.map((file) => createUploadDraft(file)));
    setUploadedNodes((current) => [...drafts, ...current]);

    event.target.value = "";
  };

  const renderNodeTile = (nodeType: string) => {
    const definition = NODE_CATALOG[nodeType];
    const NodeIcon = getNodeIcon(nodeType);

    return (
      <div
        key={nodeType}
        draggable
        onDragStart={(event) => onDragStart(event, nodeType)}
        className="cursor-grab rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 active:cursor-grabbing hover:bg-white/[0.06] hover:border-brand-purple/30 hover:shadow-[0_4px_12px_-2px_rgba(123,92,234,0.15)] transition-all group/tile"
      >
        <div className="flex items-center gap-2">
          <NodeIcon className="h-3.5 w-3.5 text-brand-purple group-hover/tile:text-brand-cyan transition-colors" />
          <p className="text-xs font-semibold text-white">{definition?.defaultData.label}</p>
        </div>
        <p className="mt-1 text-[11px] text-brand-text-muted">{definition?.defaultData.description}</p>
      </div>
    );
  };

  return (
    <aside className="z-10 flex h-full w-[300px] min-w-[300px] flex-col overflow-hidden border-r border-white/5 bg-brand-bg-surface/95 backdrop-blur-2xl">
      <div className="border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-2.5 mb-4">
          <img src={logo} alt="Balnce AI" width={24} height={24} className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(123,92,234,0.3)]" />
          <h2 className="text-xs font-black uppercase tracking-[0.15em] text-white">Node Library</h2>
        </div>
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-white/[0.03] border border-white/5 p-1">
          <button
            type="button"
            onClick={() => setTab("creative")}
            className={`rounded-lg px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${tab === "creative" ? "bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-[0_2px_8px_-2px_rgba(123,92,234,0.4)]" : "text-brand-text-muted hover:text-white"}`}
          >
            <span className="flex items-center justify-center gap-1.5"><Sparkles size={11} />Creative</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("workflow")}
            className={`rounded-lg px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${tab === "workflow" ? "bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-[0_2px_8px_-2px_rgba(123,92,234,0.4)]" : "text-brand-text-muted hover:text-white"}`}
          >
            <span className="flex items-center justify-center gap-1.5"><Zap size={11} />Workflow</span>
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 pb-20 scrollbar-gutter-stable custom-scrollbar">
        {tab === "creative" ? (
          <div className="space-y-2">
            {creativeNodeTypes.map((nodeType) => renderNodeTile(nodeType))}
            {/* Spacer to prevent overcrowding at the bottom */}
            <div className="h-8" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="group rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex items-center gap-2 px-1 py-1">
                <Zap className="h-4 w-4 text-amber-300" />
                <p className="text-xs font-bold text-white">Trigger Nodes</p>
                <span className="text-[10px] text-brand-text-muted">Hover to reveal</span>
              </div>
              <div className="max-h-0 space-y-2 overflow-y-auto custom-scrollbar opacity-0 transition-all duration-200 group-hover:mt-2 group-hover:max-h-[420px] group-hover:opacity-100">
                {triggerNodeTypes.map((nodeType) => renderNodeTile(nodeType))}
              </div>
            </div>

            <div className="group rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex items-center gap-2 px-1 py-1">
                <Group className="h-4 w-4 text-brand-cyan" />
                <p className="text-xs font-bold text-white">Action Nodes</p>
                <span className="text-[10px] text-brand-text-muted">Hover providers to reveal</span>
              </div>

              <div className="mt-2 space-y-2">
                {providerOrder
                  .filter((provider) => Boolean(actionGroups[provider]?.length))
                  .map((provider) => {
                    const providerMeta = PROVIDER_META[provider];
                    const ProviderIcon = providerMeta?.icon ?? Group;
                    const providerNodeTypes = actionGroups[provider] ?? [];

                    return (
                      <div key={provider} className="group/provider rounded-xl border border-white/5 bg-white/[0.02] p-2">
                        <div className="flex items-center gap-2">
                          <ProviderIcon className={`h-4 w-4 ${providerMeta?.colorClass ?? "text-brand-text-muted"}`} />
                          <p className="text-xs text-brand-text-body font-medium">{providerMeta?.label ?? `${provider} Actions`}</p>
                        </div>
                        <div className="max-h-0 space-y-2 overflow-y-auto custom-scrollbar opacity-0 transition-all duration-200 group-hover/provider:mt-2 group-hover/provider:max-h-[360px] group-hover/provider:opacity-100">
                          {providerNodeTypes.map((nodeType) => renderNodeTile(nodeType))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* Spacer to prevent overcrowding at the bottom */}
            <div className="h-8" />
          </div>
        )}
      </div>

      <div className="border-t border-white/5 p-5 bg-black/20">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json,image/*,audio/*"
          multiple
          className="hidden"
          onChange={handleFileSelection}
        />
        <button
          type="button"
          onClick={handleUploadClick}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-brand-text-body hover:border-brand-purple/30 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <Upload className="h-4 w-4" />
          Upload File as Node
        </button>

        {uploadedNodes.length > 0 ? (
          <div className="mb-3 max-h-32 space-y-2 overflow-auto rounded-xl border border-white/5 bg-brand-bg-page p-2 custom-scrollbar">
            {uploadedNodes.map((uploaded) => {
              const icon = getNodeIcon(uploaded.nodeType);
              const Icon = icon;
              const name = String(uploaded.dataPreset.inputs?.fileName ?? "Uploaded file");

              return (
                <div
                  key={uploaded.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, uploaded.nodeType, uploaded.dataPreset)}
                  className="cursor-grab rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-[11px] text-brand-text-body active:cursor-grabbing hover:border-brand-purple/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-brand-purple" />
                    <span className="truncate">{name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <SaveCanvasButton onSave={onSave} />
      </div>
    </aside>
  );
}
