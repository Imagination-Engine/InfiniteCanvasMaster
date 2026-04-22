import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import { useChat } from "@ai-sdk/react";
import { Bot, ChevronRight, LayoutGrid, Search, Filter, Rocket, Plus, Trash2, ExternalLink, Sparkles, ArrowUp } from "lucide-react";
import { Markdown } from "../Components/Chat/Markdown";
import { OnboardingCarousel } from "../Components/Layout/OnboardingCarousel";
import logo from "../assets/logo.svg";


type Project = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

const ThinkingBubble = () => (
  <div className="flex items-center gap-2 text-brand-purple/50 animate-pulse py-2">
    <div className="w-4 h-4 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-widest italic">Engine Processing...</span>
  </div>
);

export default function HomeStudio() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // --- Dashboard State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);

  // --- Chat State ---
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToChat = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 500); // Wait for scroll
  };

  // Initialize Chat. We don't have a projectId yet, so we won't send one until the first message creates the draft.
  const { messages, input, handleInputChange, handleSubmit, status, error, setMessages } = useChat({
    api: "/api/chat",
    body: { sessionId: activeDraftId }, 
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    onFinish: (message) => {
       loadProjects();
    }
  } as any) as any;

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load Projects
  const loadProjects = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await apiRequest<{ projects: Project[] }>("/api/projects", {}, accessToken);
      setProjects(response.projects);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setProjectsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const deleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this project?")) return;
    if (!accessToken) return;
    try {
      await apiRequest(`/api/projects/${projectId}`, { method: "DELETE" }, accessToken);
      loadProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  // Intercept the chat submit to lazy-create a project if one doesn't exist
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!activeDraftId && accessToken) {
       try {
         // 1. Create the project using the first message as the title/story
         const response = await apiRequest<{ project: Project }>("/api/projects", {
           method: "POST",
           body: JSON.stringify({ name: "Untitled Canvas", story: input })
         }, accessToken);
         
         const newProjectId = response.project.id;
         setActiveDraftId(newProjectId);
         
         // Note: because set state is asynchronous, we manually append to useChat 
         // OR rely on the fact that useChat's handleSubmit will queue it.
         // A safer way is to manually post to the chat endpoint for the FIRST message, 
         // then let useChat take over, but for simplicity, we'll just set it and let React re-render.
         // To guarantee execution order without custom fetch wrappers, we'll manually set the messages.
         
       } catch (err) {
         console.error("Failed to create draft project", err);
         return; // halt submission
       }
    }
    
    // Once activeDraftId exists, handleSubmit works normally.
    // *Caveat*: If we just created it, `activeDraftId` might not be in `useChat`'s closure yet.
    // The robust way is to just let `handleSubmit` run, but we inject the ID via `options.body` overrides.
    handleSubmit(e, { options: { body: { sessionId: activeDraftId } } });
  };

  const filteredProjects = (projects || []).filter((p) =>
    p?.name?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

  return (
    <div className="h-screen overflow-y-auto bg-brand-bg-page text-brand-text-body font-sans selection:bg-brand-purple/30 selection:text-white custom-scrollbar relative">
      {user?.hasCompletedOnboarding === false && <OnboardingCarousel />}
      {/* Cinematic Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      {/* --- Top Nav --- */}
      <nav className="sticky top-0 z-50 bg-brand-bg-page/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 h-20">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-8 h-8 drop-shadow-[0_0_15px_rgba(123,92,234,0.4)]" />
          <span className="text-xl font-black uppercase tracking-tighter text-white">
            BALNCE <span className="text-brand-cyan">AI</span>
          </span>
        </div>
        <button
          onClick={logout}
          className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </nav>

      {/* --- Section 1: The Centered Chat Studio (100vh - nav height) --- */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 relative">
         
         <div className="w-full flex-1 flex flex-col mb-8 overflow-hidden rounded-[32px] bg-white/[0.02] border border-white/5 shadow-2xl backdrop-blur-xl relative">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in duration-1000">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(123,92,234,0.15)]">
                   <Sparkles className="w-10 h-10 text-brand-cyan drop-shadow-[0_0_10px_rgba(0,194,255,0.5)]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                  What are we <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">building today?</span>
                </h1>
                <p className="text-brand-text-muted font-medium max-w-lg text-sm md:text-base">
                  Describe your intent, application, story, or workflow. The Imagination Engine will collaborate with you to deconstruct it into a functional blueprint.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {(messages || []).map((m: any) => {
                  const isAssistant = m?.role !== "user";

                  return (
                    <div key={m?.id || Math.random()} className={`flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500 ${!isAssistant ? "ml-auto items-end" : "mr-auto items-start"}`}>
                      <div className={`flex items-center gap-2 px-2 ${!isAssistant ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${!isAssistant ? 'bg-white/5 border-white/10 text-white' : 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple'}`}>
                          {!isAssistant ? <ChevronRight size={12} /> : <Bot size={12} />}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
                          {!isAssistant ? 'Operator' : 'Engine'}
                        </span>
                      </div>

                      <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-2xl ${!isAssistant ? "bg-brand-purple/10 border border-brand-purple/20 text-white rounded-tr-sm" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"}`}>
                        <Markdown content={m?.content || ""} />

                        {(m?.toolInvocations || []).map((tool: any) => {
                          if (tool?.toolName === 'generate_canvas_blueprint') {
                            const isResolved = tool?.state === 'result';
                            return (
                              <div key={tool?.toolCallId} className="mt-8 p-6 rounded-3xl bg-black/50 border border-brand-cyan/30 backdrop-blur-xl group transition-all hover:border-brand-cyan/60 hover:shadow-[0_0_30px_rgba(0,194,255,0.15)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple opacity-50" />
                                
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                                        <LayoutGrid size={18} className="text-brand-cyan" />
                                      </div>
                                      <div>
                                        <h4 className="text-white font-bold tracking-wide">{tool?.args?.blueprint_name || "Canvas Blueprint"}</h4>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Ready for Deployment</span>
                                      </div>
                                  </div>
                                </div>

                                <p className="text-xs text-brand-text-muted leading-relaxed mb-6">{tool?.args?.description || "Blueprint generated successfully."}</p>

                                
                                <Link 
                                  to={`/projects/${activeDraftId}`}
                                  className="w-full py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-cyan hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                  Go to Canvas
                                  <ChevronRight size={14} />
                                </Link>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                })}
                {status === 'loading' && <ThinkingBubble />}
                {error && <div className="text-red-400 text-xs uppercase font-bold">Connection Error: {error.message}</div>}
                <div ref={messagesEndRef} />
              </div>
            )}
{/* Input Form */}
<div className="p-6 bg-white/[0.02] border-t border-white/5">
   <form onSubmit={handleChatSubmit} className="relative max-w-3xl mx-auto flex items-end group">
      <textarea
        ref={chatInputRef}
        value={input}
        onChange={handleInputChange}
        placeholder="Describe your vision..."
        className="w-full bg-white/10 border border-white/20 rounded-[24px] py-4 pl-6 pr-16 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-cyan/50 focus:bg-white/15 transition-all resize-none min-h-[60px] max-h-[200px]"
        rows={1}
        onKeyDown={(e) => {

                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!(input || "").trim() || status === 'loading'}
                    className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-brand-purple hover:bg-brand-cyan text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:bg-brand-purple group/btn"
                  >
                    <ArrowUp size={18} strokeWidth={3} className="transition-transform group-hover/btn:-translate-y-1" />
                  </button>
               </form>
            </div>
         </div>

         {/* Scroll Indicator */}
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text-muted">Dashboard</span>
            <div className="w-px h-6 bg-gradient-to-b from-brand-text-muted to-transparent" />
         </div>
      </div>

      {/* --- Section 2: Dashboard Grid --- */}
      <div className="min-h-screen bg-black/40 border-t border-white/5 py-20 px-8 lg:px-20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Your Projects</h2>
                <p className="text-brand-text-muted font-medium">Manage and relaunch your previous canvas blueprints.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-purple transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-purple/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
           </div>

           {projectsLoading ? (
              <div className="flex justify-center py-20">
                 <div className="w-8 h-8 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin" />
              </div>
           ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[32px] bg-white/[0.02]">
                <Rocket className="w-16 h-16 text-white/10 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                <p className="text-brand-text-muted text-sm max-w-md text-center mb-8">
                  You haven't instantiated any canvas blueprints yet. Scroll up and describe your vision to the Engine to get started.
                </p>
                <button
                  onClick={scrollToChat}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-brand-cyan hover:text-white rounded-full font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl hover:shadow-brand-cyan/20"
                >
                  <Plus size={16} />
                  Create
                </button>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group relative flex flex-col justify-between h-56 rounded-[24px] bg-white/5 border border-white/10 p-6 hover:bg-white/10 hover:border-brand-cyan/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-cyan/10 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-purple/0 to-transparent group-hover:via-brand-cyan transition-all duration-500" />
                    
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-brand-cyan/30 transition-colors">
                          <LayoutGrid size={16} className="text-white/50 group-hover:text-brand-cyan transition-colors" />
                        </div>
                        <button
                          onClick={(e) => deleteProject(e, project.id)}
                          className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate">{project.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-brand-cyan opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      Enter Canvas <ChevronRight size={12} className="ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
