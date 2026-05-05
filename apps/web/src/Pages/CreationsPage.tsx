import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import { ChevronRight, Search, Plus, Trash2, Clock } from "lucide-react";

interface Project {
  id: string;
  name: string;
  surfaceType: string;
  updatedAt: string;
}

export default function CreationsPage() {
  const { accessToken, refresh } = useAuth();

  // --- Dashboard State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Load Projects
  const loadProjects = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await apiRequest<{ projects: Project[] }>(
        "/api/projects",
        { onUnauthorized: refresh } as any,
        accessToken,
      );
      setProjects(response.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setProjectsLoading(false);
    }
  }, [accessToken, refresh]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const deleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this project?")) return;
    if (!accessToken) return;
    try {
      await apiRequest(
        `/api/projects/${projectId}`,
        { method: "DELETE", onUnauthorized: refresh } as any,
        accessToken,
      );
      loadProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const filteredProjects = (projects || []).filter((p) =>
    p?.name?.toLowerCase().includes(searchQuery?.toLowerCase() || ""),
  );

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg-page text-brand-text-body font-sans selection:bg-brand-purple/30 selection:text-white custom-scrollbar relative px-8 py-24">
      {/* Cinematic Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter">
              My <span className="text-brand-purple">Creations</span>
            </h2>
            <p className="text-brand-text-muted font-medium max-w-md">
              Manage and deploy your agentic architectures from the neural
              library.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-cyan transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Filter neural patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:bg-white/10 transition-all w-64"
              />
            </div>
            <Link
              to="/projects"
              className="p-3 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-2xl hover:bg-brand-purple hover:text-white transition-all active:scale-95"
            >
              <Plus size={20} />
            </Link>
          </div>
        </div>

        {/* Grid Area */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-32 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Clock className="text-white/20" size={24} />
            </div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-2">
              No patterns found
            </h3>
            <p className="text-brand-text-muted text-sm mb-8">
              Start a new synchronization to build a blueprint.
            </p>
            <Link
              to="/projects"
              className="text-brand-purple text-xs font-black uppercase tracking-widest hover:text-brand-cyan transition-colors"
            >
              Initialize First Node
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group relative h-64 rounded-[32px] bg-brand-bg-surface border border-white/5 p-8 flex flex-col justify-between hover:border-brand-purple/40 hover:shadow-[0_0_40px_rgba(123,92,234,0.1)] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 blur-[60px] -z-10 group-hover:bg-brand-cyan/20 transition-colors" />

                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(0,194,255,0.8)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">
                        Active Blueprint
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-brand-purple transition-colors line-clamp-1">
                      {project.name}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => deleteProject(e, project.id)}
                    className="p-2 text-white/10 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-text-muted">
                      Last Synced
                    </span>
                    <span className="text-xs text-white/60 font-medium">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white group-hover:bg-brand-purple transition-all">
                    Enter Canvas <ChevronRight size={12} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
