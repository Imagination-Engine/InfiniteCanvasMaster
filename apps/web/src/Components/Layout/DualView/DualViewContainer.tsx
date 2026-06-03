// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from "react";
import JSZip from "jszip";
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
  Loader2,
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
    if (isRunning) return;
    setIsRunning(true);
    setIsRunPanelOpen(true); // Open panel to show progress

    const { objects, updateObject } = useCanvasStore.getState();
    const { connections } = useConnectionStore.getState();

    try {
      console.log("[EXECUTION] Analyzing canvas for automated run...");

      // 1. Identify workflow type
      const hasAppNodes = Object.values(objects).some(
        (o) =>
          o.type === "iem.core.programmer" ||
          o.type === "iem.app.web" ||
          o.type === "forge.builder" ||
          o.type === "iem.forge.builder" ||
          o.type.startsWith("forge."),
      );
      const sceneNodes = Object.values(objects).filter(
        (o) => o.type === "iem.reel.textToImage" || o.type === "textToImage",
      );
      const forgeNode = Object.values(objects).find(
        (o) => o.type === "iem.studio.video" || o.type === "reel.forge",
      );

      if (!hasAppNodes && sceneNodes.length === 0 && !forgeNode) {
        throw new Error("No executable nodes found on the canvas.");
      }

      // ─── OPTION A: MOVIE AUTOMATION (Auto-Forge) ─────────────────────────
      if (!hasAppNodes && (sceneNodes.length > 0 || forgeNode)) {
        console.log("[AUTO-FORGE] Starting movie sequence...");
        const generatedImages: Record<string, string> = {};

        for (const node of sceneNodes) {
          updateObject(node.id, { status: "running" });

          const prompt = (
            node.metadata?.inputs?.prompt ||
            node.metadata?.description ||
            node.metadata?.label ||
            "A cinematic scene"
          ).trim();

          console.log(
            `[AUTO-FORGE] Generating scene: ${node.id} with prompt: ${prompt}`,
          );

          const res = await fetch(`/api/reel/generate-image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });

          if (!res.ok)
            throw new Error(`Image generation failed for ${node.id}`);
          const { imageUrl } = await res.json();
          generatedImages[node.id] = imageUrl;
          updateObject(node.id, {
            status: "complete",
            metadata: {
              ...node.metadata,
              imageUrl,
              outputs: { ...(node.metadata?.outputs || {}), imageUrl },
            },
          });
        }

        // 3. Automate Video Forge
        if (forgeNode) {
          console.log(
            `[AUTO-FORGE] Starting final video forge for node: ${forgeNode.id}`,
          );
          updateObject(forgeNode.id, { status: "running" });

          // Collect all images (including newly generated ones)
          const referenceImages: any[] = [];

          // Find nodes connected TO the forge node
          const upstreamEdges = Object.values(connections).filter(
            (c) => c.toId === forgeNode.id,
          );
          upstreamEdges.forEach((edge) => {
            const sourceNode = objects[edge.fromId];
            const url =
              generatedImages[edge.fromId] ||
              sourceNode?.metadata?.imageUrl ||
              sourceNode?.metadata?.inputs?.imageUrl;
            if (url) referenceImages.push({ url });
          });

          const forgePrompt = (
            forgeNode.metadata?.description ||
            forgeNode.metadata?.label ||
            "A cinematic movie sequence"
          ).trim();

          const res = await fetch(`/api/reel/generate-video`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: forgePrompt,
              referenceImages: referenceImages.slice(0, 3),
            }),
          });

          if (!res.ok) throw new Error("Video forge failed to start");

          const { operationId } = await res.json();
          console.log(
            `[AUTO-FORGE] Video job started: ${operationId}. Polling...`,
          );

          // Poll for completion
          let clipUrl = "";
          for (let i = 0; i < 100; i++) {
            await new Promise((r) => setTimeout(r, 4000));
            const poll = await fetch(`/api/reel/generate-video/${operationId}`);
            if (!poll.ok) continue;
            const job = await poll.json();

            if (job.status === "done") {
              clipUrl = job.clipUrl;
              break;
            }
            if (job.status === "error")
              throw new Error(job.error || "Forge failed");
          }

          if (!clipUrl) throw new Error("Video generation timed out");

          // Update forge node on canvas
          updateObject(forgeNode.id, {
            status: "complete",
            metadata: {
              ...forgeNode.metadata,
              clipUrl,
              outputs: { ...(forgeNode.metadata?.outputs || {}), clipUrl },
            },
          });

          // Set a dummy lastRun to close the loading state in the sidebar
          setLastRun({
            success: true,
            results: { clipUrl },
            steps: Object.fromEntries(
              Object.keys(generatedImages).map((id) => [
                id,
                { status: "success" },
              ]),
            ),
          });
        } else {
          // Just scenes
          setLastRun({
            success: true,
            steps: Object.fromEntries(
              Object.keys(generatedImages).map((id) => [
                id,
                { status: "success" },
              ]),
            ),
          });
        }
      }

      // ─── OPTION B: APP AUTOMATION (Sequential Code Builder) ──────────────
      else {
        console.log("[AUTO-BUILDER] Starting software sequence...");

        // Clear status and setup server request
        Object.keys(objects).forEach((id) => {
          updateObject(id, { status: "running" });
        });

        const viewport = useViewportStore.getState();
        const document = exportCanvasToDocument(objects, connections, {
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom,
        }) as UnifiedCanvasDocument;

        const response = await apiRequest(
          `/api/projects/${projectId}/execute`,
          {
            method: "POST",
            body: JSON.stringify({ document, triggerData: {} }),
          },
          accessToken,
        );

        setLastRun(response);

        // Apply results to nodes from all steps
        if (response.steps) {
          Object.entries(response.steps).forEach(
            ([nodeId, step]: [string, any]) => {
              const existing = objects[nodeId];
              if (existing && step.status === "success") {
                const result = step.output?.payload || step.output;
                updateObject(nodeId, {
                  status: "complete",
                  metadata: {
                    ...existing.metadata,
                    outputs: {
                      ...(existing.metadata?.outputs || {}),
                      ...result,
                    },
                    generatedCode:
                      result.generatedCode || existing.metadata?.generatedCode,
                  },
                });
              } else if (existing && step.status === "failed") {
                updateObject(nodeId, { status: "error" });
              }
            },
          );
        }
      }

      console.log("[EXECUTION] Workflow complete!");
    } catch (err: any) {
      console.error("[EXECUTION] Critical Failure:", err);
      setLastRun({ success: false, error: err.message });
      // Reset all running nodes to error
      Object.values(objects).forEach((o) => {
        if (o.status === "running") updateObject(o.id, { status: "error" });
      });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, projectId, accessToken]);

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

    const isUrl =
      typeof content === "string" &&
      (content.startsWith("http") ||
        content.startsWith("/") ||
        content.startsWith("blob:") ||
        content.startsWith("data:"));

    if (isUrl) {
      // Direct download for URLs to avoid Blob corruption
      const a = document.createElement("a");
      a.href = content;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Blob download for raw text/code
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const [artifacts, setArtifacts] = useState<any[]>([]);

  useEffect(() => {
    if (!lastRun) {
      setArtifacts([]);
      return;
    }

    const found: any[] = [];
    const seen = new Set();

    const processPayload = async (payload: any, source: string) => {
      if (!payload || typeof payload !== "object") return;

      const currentFound: any[] = [];
      let hasZip = false;

      // Handle multi-file project (ZIP)
      if (payload.files && Array.isArray(payload.files)) {
        try {
          const zip = new JSZip();
          payload.files.forEach((file: any) => {
            zip.file(file.name, file.content);
          });

          // Also include generatedCode if it exists and isn't already in files
          if (
            payload.generatedCode &&
            !payload.files.find((f: any) => f.content === payload.generatedCode)
          ) {
            zip.file("main_output.txt", payload.generatedCode);
          }

          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = URL.createObjectURL(zipBlob);

          found.push({
            id: `${source}-project-zip`,
            name: `project-${source.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.zip`,
            type: "file",
            content: zipUrl,
            mime: "application/zip",
            label: "Packaged Project (ZIP)",
            icon: File,
            source,
          });
          hasZip = true;
        } catch (e) {
          console.error("Failed to generate ZIP artifact", e);
        }
      }

      const config = [
        {
          key: "generatedCode",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
          skipIfZip: true,
        },
        {
          key: "code",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
          skipIfZip: true,
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
          skipIfZip: true,
        },
        {
          key: "design",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
        },
        {
          key: "specs",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
        },
        {
          key: "assets",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
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
          key: "clipUrl",
          type: "video",
          ext: "mp4",
          mime: "video/mp4",
          icon: Film,
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

      config.forEach(({ key, type, ext, mime, icon, skipIfZip }) => {
        if (payload[key]) {
          if (hasZip && skipIfZip) return;

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
            } else if (
              content.includes("def ") ||
              content.includes("import os") ||
              content.includes("import sys")
            ) {
              finalExt = "py";
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

    const run = async () => {
      // 1. Process final results
      const finalPayload = lastRun.results?.payload || lastRun.results;
      await processPayload(finalPayload, "final");

      // 2. Process all steps
      if (lastRun.steps) {
        for (const [stepId, step] of Object.entries(lastRun.steps)) {
          const stepPayload =
            (step as any).output?.payload || (step as any).output;
          await processPayload(stepPayload, stepId);
        }
      }
      setArtifacts(found);
    };

    run();
  }, [lastRun]);

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* 1. Main Area: Spatial Engine Canvas */}
      <CanvasShell canvasId={projectId} sessionContext={sessionSummary}>
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
            {artifacts.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  Generated Artifacts
                </div>
                <button
                  onClick={() => {
                    artifacts.forEach((art) => {
                      setTimeout(() => {
                        downloadFile(art.name, art.content, art.mime);
                      }, 100);
                    });
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-purple text-white hover:bg-brand-purple-light border border-brand-purple/30 text-[10px] font-black uppercase tracking-widest"
                  title="Download all generated files"
                >
                  <Download size={14} />
                  Export All (${artifacts.length})
                </button>
              </div>
            )}

            {artifacts.length > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2
                  size={32}
                  className="text-brand-purple animate-spin mb-4"
                />
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Assembling vision...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
