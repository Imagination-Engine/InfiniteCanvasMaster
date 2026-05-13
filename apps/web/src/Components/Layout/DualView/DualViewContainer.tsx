// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { apiRequest } from "../../../lib/api";
import { useAuth } from "../../../auth/AuthContext";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Code,
  File,
  ExternalLink,
} from "lucide-react";

import {
  CanvasShell,
  InfiniteViewport,
  useCanvasStore,
  useConnectionStore,
} from "@iem/imagination-canvas-kit";

interface DualViewContainerProps {
  projectId: string;
  initialDocument: UnifiedCanvasDocument | null;
  initialMessages: any[];
  projectName: string;
  saveCanvas: (doc: UnifiedCanvasDocument) => Promise<void>;
}

export const DualViewContainer: React.FC<DualViewContainerProps> = ({
  projectId,
  initialDocument,
  initialMessages,
}) => {
  const { accessToken } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<any>(null);
  const [isRunPanelOpen, setIsRunPanelOpen] = useState(false);

  // --- Create Session Context Summary ---
  const sessionSummary = React.useMemo(() => {
    const userMessages = (initialMessages || [])
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .slice(0, 3)
      .join(" | ");
    return userMessages || "New Creative Session";
  }, [initialMessages]);

  // --- Spatial Sync: Initialize Stores from Document ---
  useEffect(() => {
    if (!initialDocument) return;

    const objects: Record<string, any> = {};
    (initialDocument.nodes || []).forEach((node) => {
      objects[node.id] = {
        id: node.id,
        type: node.type || "note",
        x: node.position?.x || (node as any).x || 0,
        y: node.position?.y || (node as any).y || 0,
        width: node.width || 320,
        height: node.height || 240,
        zIndex: 1,
        status: "idle",
        metadata: {
          label: node.data?.label,
          description: node.data?.description,
          ...node.data,
        },
      };
    });
    useCanvasStore.setState({ objects: objects as any });

    const connections: Record<string, any> = {};
    (initialDocument.edges || []).forEach((edge) => {
      connections[edge.id] = {
        id: edge.id,
        fromId: edge.source,
        toId: edge.target,
        label: edge.label || edge.data?.label,
      };
    });
    useConnectionStore.setState({ connections });
  }, [initialDocument]);

  const handleRunGraph = async () => {
    if (!accessToken) return;
    setIsRunning(true);

    try {
      const objects = useCanvasStore.getState().objects;
      const connections = useConnectionStore.getState().connections;

      // Compile into expected document format
      const document = {
        nodes: Object.values(objects).map((obj) => ({
          id: obj.id,
          type: obj.type,
          data: {
            ...obj.metadata,
            inputs: obj.metadata?.inputs || {},
          },
        })),
        edges: Object.values(connections).map((conn) => ({
          id: conn.id,
          sourceId: conn.fromId,
          targetId: conn.toId,
        })),
      };

      // Set all nodes to 'running' visually
      Object.keys(objects).forEach((id) => {
        useCanvasStore.getState().updateObject(id, { status: "running" });
      });

      const response = await apiRequest(
        `/api/projects/${projectId}/execute`,
        {
          method: "POST",
          body: JSON.stringify({ document, triggerData: {} }),
        },
        accessToken,
      );

      setLastRun(response);
      setIsRunPanelOpen(true);
      console.log("Execution Result:", response);

      // Set all nodes to 'complete' visually
      Object.keys(objects).forEach((id) => {
        useCanvasStore.getState().updateObject(id, { status: "complete" });
      });
    } catch (err) {
      console.error("Failed to run graph:", err);
      // Set all nodes to 'error' visually
      const objects = useCanvasStore.getState().objects;
      Object.keys(objects).forEach((id) => {
        useCanvasStore.getState().updateObject(id, { status: "error" });
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadFile = (
    filename: string,
    content: string,
    mime = "text/plain",
  ) => {
    if (!content) return;

    let url;
    const isUrl =
      typeof content === "string" &&
      (content.startsWith("http") || content.startsWith("data:"));

    if (isUrl) {
      url = content;
    } else {
      const blob = new Blob([content], { type: mime });
      url = URL.createObjectURL(blob);
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    if (!isUrl) {
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 100);
    } else {
      a.remove();
    }
  };

  const artifacts = React.useMemo(() => {
    if (!lastRun) return [];
    const found: any[] = [];
    const seen = new Set();

    const processPayload = (payload: any, source: string) => {
      if (!payload || typeof payload !== "object") return;

      const config = [
        {
          key: "generatedCode",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
        },
        {
          key: "code",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
        },
        {
          key: "formattedFile",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
        },
        {
          key: "spec",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
        },
        {
          key: "design",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
        },
        {
          key: "imageUrl",
          type: "image",
          ext: "png",
          mime: "image/png",
          icon: ImageIcon,
        },
        {
          key: "audioUrl",
          type: "audio",
          ext: "mp3",
          mime: "audio/mpeg",
          icon: Music,
        },
        {
          key: "fileUrl",
          type: "file",
          ext: "bin",
          mime: "application/octet-stream",
          icon: File,
        },
        {
          key: "trackUrl",
          type: "audio",
          ext: "mp3",
          mime: "audio/mpeg",
          icon: Music,
        },
        {
          key: "results",
          type: "text",
          ext: "txt",
          mime: "text/plain",
          icon: FileText,
        },
      ];

      config.forEach(({ key, type, ext, mime, icon }) => {
        if (payload[key]) {
          const content = payload[key];
          let finalExt = ext;
          let finalMime = mime;

          if (type === "code" && typeof content === "string") {
            if (
              content.includes("<!DOCTYPE html>") ||
              content.includes("<html")
            ) {
              finalExt = "html";
              finalMime = "text/html";
            } else if (
              content.includes("import React") ||
              content.includes("export default")
            ) {
              finalExt = "tsx";
            }
          }

          const hash = `${type}-${typeof content === "string" ? (content.length > 100 ? content.substring(0, 100) : content) : JSON.stringify(content)}`;
          if (!seen.has(hash)) {
            seen.add(hash);
            found.push({
              id: `${source}-${key}`,
              name: `${key}-${source.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${finalExt}`,
              type,
              content,
              mime: finalMime,
              label: key,
              icon,
              source,
            });
          }
        }
      });
    };

    // 1. Process final results
    const finalPayload = lastRun.results?.payload || lastRun.results;
    processPayload(finalPayload, "final");

    // 2. Process all steps
    if (lastRun.steps) {
      Object.entries(lastRun.steps).forEach(([stepId, step]: [string, any]) => {
        const stepPayload = step.output?.payload || step.output;
        processPayload(stepPayload, stepId);
      });
    }

    return found;
  }, [lastRun]);

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* New Spatial Engine Canvas - The sole source of truth */}
      <CanvasShell
        canvasId={projectId}
        sessionContext={sessionSummary}
        onRunGraph={handleRunGraph}
        isRunning={isRunning}
      >
        <InfiniteViewport />
      </CanvasShell>

      {isRunPanelOpen && (
        <div className="absolute right-4 bottom-4 z-[60] w-[520px] max-w-[92vw] max-h-[60vh] overflow-hidden rounded-2xl border border-white/10 bg-brand-bg-page/90 backdrop-blur-2xl shadow-2xl text-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                Last Run
              </div>
              <div className="text-xs text-white/80 truncate">
                runId: {lastRun?.runId || "—"} ·{" "}
                {lastRun?.success ? "success" : "failed"}
              </div>
            </div>
            <button
              onClick={() => setIsRunPanelOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[10px] font-black uppercase tracking-widest"
            >
              Close
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[50vh]">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() =>
                  downloadFile(
                    `workflow-run-${lastRun?.runId || "latest"}.json`,
                    JSON.stringify(lastRun, null, 2),
                    "application/json",
                  )
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-[10px] font-black uppercase tracking-widest"
                title="Download the full run payload as JSON"
              >
                <Download size={14} />
                Download JSON
              </button>
            </div>

            {artifacts.length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">
                  Generated Artifacts
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {artifacts.map((art) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {art.type === "image" &&
                        typeof art.content === "string" &&
                        (art.content.startsWith("data:") ||
                          art.content.startsWith("http")) ? (
                          <img
                            src={art.content}
                            className="w-10 h-10 rounded-lg bg-black/20 object-cover border border-white/10"
                            alt="preview"
                          />
                        ) : (
                          <div className="p-2 rounded-lg bg-brand-purple/20 text-brand-purple-light">
                            <art.icon size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">
                            {art.name}
                          </div>
                          <div className="text-[9px] text-white/40 uppercase tracking-tighter">
                            {art.type} · {art.source}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {art.type === "image" &&
                          typeof art.content === "string" && (
                            <a
                              href={art.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                              title="View full image"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        <button
                          onClick={() =>
                            downloadFile(art.name, art.content, art.mime)
                          }
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                          title="Download artifact"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
              Raw Output
            </div>
            <pre className="text-[11px] whitespace-pre-wrap break-words bg-black/30 border border-white/10 rounded-xl p-3 overflow-auto">
              {JSON.stringify(
                {
                  results: lastRun?.results,
                  steps: lastRun?.steps,
                  error: lastRun?.error,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
