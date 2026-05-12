// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useSessionStore } from "../../../store/useSessionStore";
import type { UnifiedCanvasDocument } from "../../../nodes/canvasTypes";
import { apiRequest } from "../../../lib/api";
import { useAuth } from "../../../auth/AuthContext";
import { Download } from "lucide-react";

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

  const downloadText = (
    filename: string,
    content: string,
    mime = "text/plain",
  ) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const inferredCode =
    (typeof lastRun?.results?.code === "string" && lastRun.results.code) ||
    (typeof lastRun?.results?.formattedFile === "string" &&
      lastRun.results.formattedFile) ||
    null;

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
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() =>
                  downloadText(
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

              {inferredCode && (
                <button
                  onClick={() =>
                    downloadText(
                      `artifact-${lastRun?.runId || "latest"}.txt`,
                      inferredCode,
                      "text/plain",
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/20 border border-brand-cyan/25 text-[10px] font-black uppercase tracking-widest"
                  title="Download code-like output as a text file"
                >
                  <Download size={14} />
                  Download Artifact
                </button>
              )}
            </div>

            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
              Output
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
