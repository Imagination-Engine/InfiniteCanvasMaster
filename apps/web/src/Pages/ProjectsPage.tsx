import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import { OnboardingCarousel } from "../Components/Layout/OnboardingCarousel";
import { CreateProjectModal } from "../Components/Layout/CreateProjectModal";
import {
  Plus,
  Search,
  Filter,
  Rocket,
  Trash2,
  ExternalLink,
  LayoutGrid,
} from "lucide-react";
import logo from "../assets/logo.svg";

type Project = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function ProjectsPage() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useUserStore();

  useEffect(() => {
    if (user && typeof user.hasCompletedOnboarding === "boolean") {
      if (user.hasCompletedOnboarding !== hasCompletedOnboarding) {
        setHasCompletedOnboarding(user.hasCompletedOnboarding);
      }
    }
  }, [user]);

  const loadProjects = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ projects: Project[] }>(
        "/api/projects",
        {},
        accessToken,
      );
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

  const handleCreateProject = async (name: string, story: string) => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest<{ project: Project }>(
        "/api/projects",
        {
          method: "POST",
          body: JSON.stringify({ name, story }),
        },
        accessToken,
      );

      setProjects((current) => [response.project, ...current]);
      setIsModalOpen(false);

      // Auto-redirect to the new canvas
      navigate(`/projects/${response.project.id}/canvas`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!accessToken) return;
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    )
      return;

    setError(null);
    try {
      await apiRequest<void>(
        `/api/projects/${projectId}`,
        { method: "DELETE" },
        accessToken,
      );
      setProjects((current) =>
        current.filter((project) => project.id !== projectId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [projects, searchQuery]);

  return (
    <div className="min-h-screen bg-brand-bg-page text-brand-text-body font-sans selection:bg-brand-purple/30 selection:text-white relative overflow-x-hidden p-6 md:p-12">
      {/* Onboarding Flow */}
      {!hasCompletedOnboarding &&
        user &&
        user.hasCompletedOnboarding === false && <OnboardingCarousel />}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        isSubmitting={submitting}
      />

      {/* Background Patterns */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg-page via-transparent to-brand-bg-page" />
      </div>

      <div className="fixed top-0 right-[-10%] w-[800px] h-[800px] bg-brand-purple/10 rounded-full blur-[150px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] -z-10" />

      <div className="mx-auto max-w-6xl space-y-12 relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src={logo}
                alt="Balnce AI"
                width={48}
                height={48}
                className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(123,92,234,0.4)]"
              />
            </Link>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black uppercase tracking-widest text-white leading-none">
                Venture Command
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text-muted">
                Operator: <span className="text-brand-cyan">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand-purple to-brand-cyan text-white px-8 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(123,92,234,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(34,211,238,0.5)] active:scale-95 transition-all duration-300"
            >
              <Plus size={16} strokeWidth={3} />
              Create Project
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-white/10 px-6 py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 hover:border-brand-purple/50 transition-all text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/[0.02] border border-white/5 p-2 rounded-3xl backdrop-blur-sm">
          <div className="relative flex-1 w-full group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-muted group-focus-within:text-brand-purple transition-colors"
              size={18}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your imagination..."
              className="w-full rounded-2xl bg-white/[0.03] border border-white/5 px-14 py-4 text-white placeholder:text-brand-text-muted/40 outline-none focus:border-brand-purple/30 focus:bg-white/[0.05] transition-all"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 px-6 py-4 rounded-2xl border border-white/5 text-brand-text-muted hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-[20px] text-[12px] font-medium tracking-wide uppercase animate-in slide-in-from-top-2">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-text-muted animate-pulse">
              Synchronizing Data
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 bg-white/[0.01] rounded-[40px] text-center space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-purple/20 blur-[50px] rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple">
                    <Rocket size={48} className="animate-bounce" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                    Create with your imagination
                  </h3>
                  <p className="text-brand-text-muted text-sm max-w-xs mx-auto leading-relaxed">
                    Your neural network is empty. Initialize your first project
                    to begin the synthesis process.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-full border border-brand-purple/50 px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-purple/10 transition-all active:scale-95 shadow-[0_0_20px_rgba(123,92,234,0.2)] hover:shadow-[0_0_30px_rgba(123,92,234,0.4)]"
                >
                  Start New Session
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative rounded-[32px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl p-8 flex flex-col justify-between gap-8 transition-all duration-500 hover:border-brand-purple/40 hover:shadow-2xl hover:shadow-brand-purple/10"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-brand-cyan group-hover:text-white transition-colors group-hover:bg-brand-purple/20">
                          <LayoutGrid size={24} />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => void deleteProject(project.id)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-brand-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-brand-cyan transition-all">
                          {project.name}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-brand-cyan" />
                          Last Sync:{" "}
                          {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/projects/${project.id}`}
                      className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-purple/20 hover:border-brand-purple/30 transition-all active:scale-[0.98]"
                    >
                      Enter Canvas
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
