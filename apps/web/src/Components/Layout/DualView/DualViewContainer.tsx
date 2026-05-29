// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { apiRequest } from "../../../lib/api";
import { useAuth } from "../../../auth/AuthContext";
import { CopilotSidebar } from "../../Chat/CopilotSidebar";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Code,
  File,
  ExternalLink,
  Film,
  Play,
  X,
} from "lucide-react";

import {
  CanvasShell,
  InfiniteViewport,
  useCanvasStore,
  useConnectionStore,
  mergeDocumentIntoCanvasObjects,
  documentEdgesToConnections,
  exportCanvasToDocument,
} from "@iem/imagination-canvas-kit";
import { useViewportStore } from "@iem/imagination-canvas-kit";

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
  saveCanvas,
}) => {
  const { accessToken } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<any>(null);
  const [isRunPanelOpen, setIsRunPanelOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const documentSyncedRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistSpatialToServer = useCallback(() => {
    if (!saveCanvas) return;
    const objects = useCanvasStore.getState().objects;
    const connections = useConnectionStore.getState().connections;
    const viewport = useViewportStore.getState();
    const doc = exportCanvasToDocument(objects, connections, {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    }) as UnifiedCanvasDocument;
    void saveCanvas(doc).catch((err) =>
      console.warn("[DualView] Failed to persist spatial canvas:", err),
    );
  }, [saveCanvas]);

  const schedulePersist = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistSpatialToServer();
    }, 800);
  }, [persistSpatialToServer]);
  // --- Create Session Context Summary ---
  const sessionSummary = React.useMemo(() => {
    const userMessages = (initialMessages || [])
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .slice(0, 3)
      .join(" | ");
    return userMessages || "New Creative Session";
  }, [initialMessages]);

  const applyDocumentToStores = useCallback((doc: UnifiedCanvasDocument) => {
    const currentObjects = useCanvasStore.getState().objects;
    const merged = mergeDocumentIntoCanvasObjects(currentObjects, doc);
    useCanvasStore.setState({ objects: merged });

    const serverConnections = documentEdgesToConnections(doc);
    const localConnections = useConnectionStore.getState().connections;
    useConnectionStore.setState({
      connections: { ...localConnections, ...serverConnections },
    });
  }, []);

  // --- Spatial Sync: merge server document after localStorage hydration ---
  useEffect(() => {
    if (!initialDocument) return;

    const docKey = `${projectId}:${initialDocument.nodes?.length ?? 0}:${initialDocument.edges?.length ?? 0}`;
    if (documentSyncedRef.current === docKey) return;

    const runMerge = () => {
      applyDocumentToStores(initialDocument);
      documentSyncedRef.current = docKey;
    };

    if (useCanvasStore.persist.hasHydrated()) {
      runMerge();
      return;
    }

    const unsub = useCanvasStore.persist.onFinishHydration(() => {
      runMerge();
    });
    return unsub;
  }, [initialDocument, projectId, applyDocumentToStores]);

  const handleRunGraph = useCallback(async () => {
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
  }, [accessToken, projectId]);

  useEffect(() => {
    const unsub = useCanvasStore.subscribe((state, prev) => {
      if (state.objects === prev.objects) return;
      schedulePersist();
    });

    const handleRemoteRun = () => {
      handleRunGraph();
    };
    window.addEventListener("iem:run-graph", handleRemoteRun);

    return () => {
      unsub();
      window.removeEventListener("iem:run-graph", handleRemoteRun);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [schedulePersist, handleRunGraph]);

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
          key: "video-project",
          type: "video",
          ext: "mp4",
          mime: "video/mp4",
          icon: Film,
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
      {/* 1. Main Area: Spatial Engine Canvas */}
      <CanvasShell
        canvasId={projectId}
        sessionContext={sessionSummary}
        onRunGraph={handleRunGraph}
        isRunning={isRunning}
      >
        <InfiniteViewport />
      </CanvasShell>

      {/* 2. Right Sidebar: The Sandbox-style Copilot */}
      <CopilotSidebar projectId={projectId} />

      {/* 3. Cinematic Movie Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(123,92,234,0.3)] border border-white/10 group">
            <video
              src={previewVideoUrl}
              autoPlay
              controls
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-xl border border-white/10 z-10"
            >
              <X size={24} />
            </button>

            {/* Cinematic Overlay UI */}
            <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-purple rounded-2xl shadow-2xl shadow-brand-purple/20">
                  <Film size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-lg">
                    Cinema Mode
                  </h3>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    Sovereign Imagination Engine
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        {art.type === "video" && (
                          <button
                            onClick={() =>
                              setPreviewVideoUrl(
                                art.content?.clipUrl || art.content,
                              )
                            }
                            className="p-2 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 transition-colors"
                            title="Play Movie"
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                        )}
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
