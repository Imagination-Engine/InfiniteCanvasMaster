import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useWorkflowStore } from "./store";
import { useNavigate, Link } from "react-router-dom";
import { Folder, Play, Clock, ChevronLeft } from "lucide-react";

export default function GalleryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const { session } = useWorkflowStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setProjects(data || []);
    };

    fetchProjects();
  }, [session, navigate]);

  const loadProject = (project: any) => {
    const { setGoal, setNodes, setEdges, setAppType, setCurrentProjectId } =
      useWorkflowStore.getState();
    setGoal(project.goal);
    setNodes(project.nodes);
    setEdges(project.edges);
    setAppType(project.app_type);
    setCurrentProjectId(project.id);
    navigate("/workflow");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft size={16} /> Back to Architect
            </Link>
            <h1 className="text-4xl font-black tracking-tighter">
              PROJECT GALLERY
            </h1>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
              User
            </p>
            <p className="font-bold">{session?.user?.email}</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
            <Folder size={48} className="text-white/10 mb-4" />
            <p className="text-white/30">
              No projects found yet. Start building!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => loadProject(p)}
                className="group bg-brand-surface border border-white/10 p-6 rounded-2xl hover:border-brand-purple transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={16} className="text-brand-purple" />
                </div>
                <div className="mb-4">
                  <span className="text-[10px] font-black px-2 py-1 bg-brand-purple/20 text-brand-purple rounded uppercase tracking-widest">
                    {p.app_type}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">
                  {p.goal}
                </h3>
                <div className="flex items-center gap-2 text-white/40 text-xs mt-6">
                  <Clock size={12} />
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
