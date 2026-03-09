import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";

type Project = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function ProjectsPage() {
  const { accessToken, user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ projects: Project[] }>("/api/projects", {}, accessToken);
      setProjects(response.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest<{ project: Project }>(
        "/api/projects",
        {
          method: "POST",
          body: JSON.stringify({ name }),
        },
        accessToken,
      );

      setProjects((current) => [response.project, ...current]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!accessToken) return;

    setError(null);
    try {
      await apiRequest<void>(`/api/projects/${projectId}`, { method: "DELETE" }, accessToken);
      setProjects((current) => current.filter((project) => project.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-page text-brand-text-body font-sans selection:bg-brand-purple/30 selection:text-white relative overflow-x-hidden p-6 md:p-12">
      {/* Global Moving Dot Grid Pattern */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg-page via-transparent to-brand-bg-page" />
      </div>

      {/* Cinematic Background Elements */}
      <div className="fixed top-0 right-[-10%] w-[800px] h-[800px] bg-brand-purple/10 rounded-full blur-[150px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] -z-10" />

      <div className="mx-auto max-w-4xl space-y-10 relative z-10 pt-10">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black uppercase tracking-widest text-white">Your Projects</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text-muted">
              Signed in as <span className="text-brand-cyan">{user?.username}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-white/10 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 hover:border-brand-purple/50 transition-all text-white w-full sm:w-auto"
          >
            Logout
          </button>
        </header>

        <form onSubmit={createProject} className="flex flex-col sm:flex-row gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your new project..."
            className="flex-1 rounded-full bg-white/[0.03] border border-white/10 px-6 py-4 text-white placeholder:text-brand-text-muted/50 outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all"
            required
          />
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white px-8 py-4 text-[12px] font-black uppercase tracking-widest shadow-[0_10px_20px_-5px_--theme(--color-brand-purple/40%)] hover:shadow-[0_15px_30px_-5px_--theme(--color-brand-cyan/50%)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-none whitespace-nowrap"
          >
            {submitting ? "Initializing..." : "Create Project"}
          </button>
        </form>

        {error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-[12px] font-medium tracking-wide uppercase">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-20 border border-white/5 bg-white/[0.02] rounded-[24px] backdrop-blur-sm">
                <p className="text-brand-text-muted text-sm font-black uppercase tracking-widest">No projects yet. Unleash your creativity.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-brand-purple/30 hover:bg-white/[0.05] transition-all duration-500 shadow-xl"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-cyan transition-all">{project.name}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                      Updated {new Date(project.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      to={`/projects/${project.id}/canvas`}
                      className="flex-1 sm:flex-none text-center rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:border-brand-purple/50 hover:bg-brand-purple/10 transition-all active:scale-95"
                    >
                      Open Canvas
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deleteProject(project.id)}
                      className="flex-1 sm:flex-none text-center rounded-full bg-transparent border border-white/10 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-text-muted hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
