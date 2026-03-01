import { ReactFlowProvider } from "@xyflow/react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Canvas from "../Components/Canvas";
import { Sidebar } from "../Components/Sidebar";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import type { CanvasDocument } from "../canvas/types/blockTypes";

type CanvasKind = "creativity" | "work";

type CanvasResponse = {
  id: string;
  kind: CanvasKind;
  name: string;
  document: CanvasDocument;
  updated_at: string;
};

export default function ProjectCanvasPage() {
  const { projectId, canvasKind } = useParams();
  const { accessToken } = useAuth();
  const [document, setDocument] = useState<CanvasDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const kind = canvasKind === "creativity" || canvasKind === "work"
    ? canvasKind
    : null;

  const loadCanvas = useCallback(async () => {
    if (!accessToken || !projectId || !kind) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ canvas: CanvasResponse }>(
        `/api/projects/${projectId}/canvases/${kind}`,
        {},
        accessToken,
      );

      setDocument(response.canvas.document);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load canvas");
    } finally {
      setLoading(false);
    }
  }, [accessToken, projectId, kind]);

  useEffect(() => {
    void loadCanvas();
  }, [loadCanvas]);

  const saveCanvas = useCallback(async (currentDocument: CanvasDocument) => {
    if (!accessToken || !projectId || !kind) {
      throw new Error("Missing auth or project information.");
    }

    await apiRequest<{ canvas: CanvasResponse }>(
      `/api/projects/${projectId}/canvases/${kind}`,
      {
        method: "PUT",
        body: JSON.stringify({ document: currentDocument }),
      },
      accessToken,
    );
  }, [accessToken, projectId, kind]);

  if (!projectId || !kind) {
    return <Navigate to="/projects" replace />;
  }

  if (loading) {
    return <div className="h-screen w-screen grid place-items-center bg-slate-950 text-slate-200">Loading canvas...</div>;
  }

  if (error) {
    return (
      <div className="h-screen w-screen grid place-items-center bg-slate-950 text-slate-200 p-6">
        <div className="space-y-4 text-center">
          <p className="text-rose-400">{error}</p>
          <Link to="/projects" className="inline-block rounded-md border border-slate-700 px-3 py-2">Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200">
        <div className="h-12 shrink-0 border-b border-slate-800 px-4 flex items-center justify-between">
          <Link to="/projects" className="text-sm hover:text-white">Back to Projects</Link>
          <p className="text-xs uppercase tracking-widest text-slate-400">{kind} canvas</p>
        </div>
        <div className="flex flex-1 min-h-0">
          <Sidebar onSave={saveCanvas} />
          <Canvas initialDocument={document} showDemo={false} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
