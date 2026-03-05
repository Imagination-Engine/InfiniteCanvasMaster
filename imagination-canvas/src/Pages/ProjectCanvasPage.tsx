import { ReactFlowProvider } from "@xyflow/react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Canvas from "../Components/Canvas";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import type { UnifiedCanvasDocument } from "../nodes/canvasTypes";
import NodeLibraryPanel from "../library/NodeLibraryPanel";

type CanvasResponse = {
  id: string;
  kind: "creativity" | "work";
  name: string;
  document: UnifiedCanvasDocument;
  updated_at: string;
};

export default function ProjectCanvasPage() {
  const { projectId } = useParams();
  const { accessToken } = useAuth();
  const [document, setDocument] = useState<UnifiedCanvasDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCanvas = useCallback(async () => {
    if (!accessToken || !projectId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ canvas: CanvasResponse }>(
        `/api/projects/${projectId}/canvas`,
        {},
        accessToken,
      );

      setDocument(response.canvas.document);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load canvas");
    } finally {
      setLoading(false);
    }
  }, [accessToken, projectId]);

  useEffect(() => {
    void loadCanvas();
  }, [loadCanvas]);

  const saveCanvas = useCallback(async (currentDocument: UnifiedCanvasDocument) => {
    if (!accessToken || !projectId) {
      throw new Error("Missing auth or project information.");
    }

    await apiRequest<{ canvas: CanvasResponse }>(
      `/api/projects/${projectId}/canvas`,
      {
        method: "PUT",
        body: JSON.stringify({ document: currentDocument }),
      },
      accessToken,
    );
  }, [accessToken, projectId]);

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (loading) {
    return <div className="grid h-screen w-screen place-items-center bg-slate-950 text-slate-200">Loading canvas...</div>;
  }

  if (error) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-slate-950 p-6 text-slate-200">
        <div className="space-y-4 text-center">
          <p className="text-rose-400">{error}</p>
          <Link to="/projects" className="inline-block rounded-md border border-slate-700 px-3 py-2">Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-200">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 px-4">
          <Link to="/projects" className="text-sm hover:text-white">Back to Projects</Link>
          <p className="text-xs uppercase tracking-widest text-slate-400">Unified Project Canvas</p>
        </div>
        <div className="flex min-h-0 flex-1">
          <NodeLibraryPanel onSave={saveCanvas} />
          <Canvas initialDocument={document} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
