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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-slate-400">Signed in as {user?.username}</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <form onSubmit={createProject} className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 px-4 py-2"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        {loading ? (
          <p className="text-slate-400">Loading projects...</p>
        ) : (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-slate-400">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <h2 className="font-medium">{project.name}</h2>
                    <p className="text-xs text-slate-500">Updated {new Date(project.updated_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${project.id}/canvas`}
                      className="rounded-md border border-sky-500/40 px-3 py-2 text-sm hover:bg-sky-500/10"
                    >
                      Open Canvas
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deleteProject(project.id)}
                      className="rounded-md border border-rose-500/40 px-3 py-2 text-sm hover:bg-rose-500/10"
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
