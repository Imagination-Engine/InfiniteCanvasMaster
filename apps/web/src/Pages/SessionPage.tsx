import { ReactFlowProvider } from "@xyflow/react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import type { UnifiedCanvasDocument } from "../nodes/canvasTypes";
import { DualViewContainer } from "../Components/Layout/DualView/DualViewContainer";
import logo from "../assets/logo.svg";

type CanvasResponse = {
  id: string;
  kind: "creativity" | "work";
  name: string;
  document: UnifiedCanvasDocument;
  updated_at: string;
};

export default function SessionPage() {
  const { projectId } = useParams();
  const { accessToken } = useAuth();
  const [document, setDocument] = useState<UnifiedCanvasDocument | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string>("Untitled");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken || !projectId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch project and messages
      const projectRes = await apiRequest<{ project: any; messages: any[] }>(
        `/api/projects/${projectId}`,
        {},
        accessToken,
      );
      setProjectName(projectRes.project.name);
      setInitialMessages(
        projectRes.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );

      // 2. Fetch canvas document
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
    void loadData();
  }, [loadData]);

  const saveCanvas = useCallback(
    async (currentDocument: UnifiedCanvasDocument) => {
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
    },
    [accessToken, projectId],
  );

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (loading) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-brand-bg-page text-brand-text-body font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-text-muted">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-brand-bg-page p-6 text-brand-text-body font-sans">
        <div className="space-y-6 text-center">
          <p className="text-rose-400 text-sm font-medium">{error}</p>
          <Link
            to="/projects"
            className="inline-block rounded-full border border-white/10 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 hover:border-brand-purple/50 transition-all"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen flex-col bg-brand-bg-page text-brand-text-body font-sans relative overflow-hidden">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-brand-bg-page/60 backdrop-blur-2xl px-6 relative z-10">
          <div className="flex items-center gap-6">
            <Link
              to="/projects"
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Dashboard
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-bold tracking-widest text-white uppercase">
              {projectName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Balnce AI"
              width={24}
              height={24}
              className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(123,92,234,0.3)]"
            />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
              Imagination{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
                Engine
              </span>
            </p>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <Link
              to="/projects"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
            >
              Exit
            </Link>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 relative">
          <DualViewContainer
            projectId={projectId}
            initialDocument={document}
            initialMessages={initialMessages}
            projectName={projectName}
            saveCanvas={saveCanvas}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
