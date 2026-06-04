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
  Eye,
} from "lucide-react";
import { RunPanel } from "./RunPanel";
import { v4 as uuidv4 } from "uuid";

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
  initialLastRun?: any;
  initialMessages: any[];
  projectName: string;
  saveCanvas: (doc: UnifiedCanvasDocument, lastRun?: any) => Promise<void>;
}

export const DualViewContainer: React.FC<DualViewContainerProps> = ({
  projectId,
  initialDocument,
  initialLastRun,
  initialMessages,
  projectName,
  saveCanvas,
}) => {
  const { accessToken } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewWebData, setPreviewWebData] = useState<{
    content: string;
    title: string;
  } | null>(null);

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
    // We save the most recent successful run if any
    const latestRun = runs.find((r) => r.status === "success") || runs[0];
    void saveCanvas(doc, latestRun).catch((err) =>
      console.warn("[DualView] Failed to persist spatial canvas:", err),
    );
  }, [saveCanvas, runs]);

  const schedulePersist = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistSpatialToServer();
    }, 800);
  }, [persistSpatialToServer]);

  // Sync initialLastRun when it loads
  useEffect(() => {
    if (initialLastRun && runs.length === 0) {
      setRuns([
        {
          ...initialLastRun,
          id: "initial",
          status: "success",
          startTime: Date.now(),
          projectName,
        },
      ]);
    }
  }, [initialLastRun, projectName]);

  // Auto-save when runs change
  useEffect(() => {
    if (runs.length > 0 && !isRunning) {
      schedulePersist();
    }
  }, [runs, isRunning, schedulePersist]);
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
    const runId = uuidv4();
    const newRun = {
      id: runId,
      status: "running",
      startTime: Date.now(),
      projectName,
    };

    setRuns((prev) => [newRun, ...prev]);

    const { objects, updateObject } = useCanvasStore.getState();
    const { connections } = useConnectionStore.getState();

    const updateRun = (patch: Partial<typeof newRun>) => {
      setRuns((prev) =>
        prev.map((r) => (r.id === runId ? { ...r, ...patch } : r)),
      );
    };

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
          updateRun({
            status: "success",
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
          updateRun({
            status: "success",
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

        updateRun({ ...response, status: "success", success: true });

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
      updateRun({ status: "failed", success: false, error: err.message });
      // Reset all running nodes to error
      Object.values(objects).forEach((o) => {
        if (o.status === "running") updateObject(o.id, { status: "error" });
      });
    }
  }, [projectId, accessToken, projectName]);

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

  return (
    <div className="relative flex flex-1 overflow-hidden h-full">
      {/* 1. Main Area: Spatial Engine Canvas */}
      <CanvasShell canvasId={projectId} sessionContext={sessionSummary}>
        <InfiniteViewport />
      </CanvasShell>

      {/* 2. Right Sidebar: The Sandbox-style Copilot */}
      <CopilotSidebar projectId={projectId} />

      {/* 3. Render Active Run Panels */}
      {runs.map((run) => (
        <RunPanel
          key={run.id}
          run={run}
          onClose={() => setRuns((prev) => prev.filter((r) => r.id !== run.id))}
          onPreviewVideo={setPreviewVideoUrl}
          onPreviewWeb={setPreviewWebData}
        />
      ))}

      {/* 4. Cinematic Movie Preview Modal */}
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

      {/* 4. Cinematic Web Preview Modal */}
      {previewWebData && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="relative w-[95vw] h-[90vh] bg-white rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.3)] border border-white/10 group flex flex-col">
            {/* Header */}
            <div className="h-14 bg-brand-bg-page border-b border-white/10 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-cyan/20 rounded-lg">
                  <Eye size={18} className="text-brand-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    Live Preview: {previewWebData.title}
                  </h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Forge Website Runtime
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewWebData(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-xl border border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white relative">
              <iframe
                srcDoc={
                  previewWebData.content.includes("<!DOCTYPE html>") ||
                  previewWebData.content.includes("<html")
                    ? previewWebData.content
                    : `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; background: #fff; color: #333; }
          </style>
        </head>
        <body>
          ${previewWebData.content}
        </body>
      </html>
    `
                }
                title="Website Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
