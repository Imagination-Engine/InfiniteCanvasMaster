import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import { useChat } from "@ai-sdk/react";
import {
  Sparkles,
  ChevronRight,
  Bot,
  LayoutGrid,
  ArrowUp,
  Search,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
} from "lucide-react";
import logo from "../assets/logo.svg";
import { Markdown } from "../Components/Chat/Markdown";

interface Project {
  id: string;
  name: string;
  surfaceType: string;
  updatedAt: string;
}

const OnboardingCarousel = () => {
  const { completeOnboarding } = useAuth();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-bg-page/95 backdrop-blur-2xl p-6">
      <div className="max-w-xl w-full bg-brand-bg-surface border border-white/10 rounded-[40px] p-12 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple" />
        <div className="w-20 h-20 rounded-3xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-10 h-10 text-brand-purple" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Neural Link Established
        </h2>
        <p className="text-brand-text-muted mb-12 leading-relaxed">
          Welcome to the substrate. I am the Imagination Engine. <br />
          My purpose is to deconstruct your vision into functional blueprints.
        </p>
        <button
          onClick={completeOnboarding}
          className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-white transition-all active:scale-95"
        >
          Initialize Synchronization
        </button>
      </div>
    </div>
  );
};

const ThinkingBubble = () => (
  <div className="flex items-center gap-3 text-brand-cyan animate-pulse py-4">
    <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
    <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
    <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
    <span className="text-[10px] font-black uppercase tracking-widest italic">
      Engine Processing...
    </span>
  </div>
);

export default function HomeStudio() {
  const { accessToken, user, logout, refresh } = useAuth();
  const navigate = useNavigate();

  // --- Layout State ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Dashboard State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);

  // --- Chat State ---
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [localInput, setLocalInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const chatState = useChat({
    api: "/api/chat",
    id: "home-studio-chat-stable",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    initialMessages: [],
    onFinish: () => {
      loadProjects();
    },
  });

  const { messages, isLoading, error } = chatState as any;

  // Debug the exact contents of the hook return
  useEffect(() => {
    if (chatState) {
      console.log("[DEBUG] useChat state:", chatState);
      console.log("[DEBUG] useChat keys:", Object.keys(chatState));
    }
  }, [chatState]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (shouldAutoScroll) {
        requestAnimationFrame(() => scrollToBottom("auto"));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldAutoScroll, scrollToBottom]);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom("smooth");
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalInput(e.target.value);
  };

  const scrollToChat = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 500);
  };

  // Load Projects
  const loadProjects = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await apiRequest<{ projects: Project[] }>(
        "/api/projects",
        { onUnauthorized: refresh },
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
        { method: "DELETE", onUnauthorized: refresh },
        accessToken,
      );
      loadProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = localInput.trim();

    if (!text || isLoading) return;

    console.log(
      "[UI] handleChatSubmit triggered for text:",
      text.substring(0, 20) + "...",
    );
    setLocalInput("");

    let sessionId = activeDraftId;
    if (!sessionId) {
      sessionId = "draft-" + Date.now();
      setActiveDraftId(sessionId);
    }

    try {
      console.log(
        "[UI] handleChatSubmit triggered. Using substrate co-pilot...",
      );
      setLocalInput("");

      let sessionId = activeDraftId;
      if (!sessionId) {
        sessionId = "draft-" + Date.now();
        setActiveDraftId(sessionId);
      }

      // We use the definitive co-pilot function from the substrate
      const state = chatState as any;
      const coPilot =
        state.append || state.sendMessage || state.reload || state.handleSubmit;

      if (typeof coPilot !== "function") {
        console.error(
          "[UI] CRITICAL: Engine co-pilot not found in substrate.",
          Object.keys(state),
        );
        throw new Error("Synchronization failure: Engine co-pilot offline.");
      }

      // We send the message and pass context in the options body
      // This is the cleanest pattern for AI SDK v6+
      await coPilot(
        { role: "user", content: text },
        {
          body: { sessionId },
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      console.log("[UI] co-pilot synchronization established.");
    } catch (err) {
      console.error("[UI] Synchronization failure:", err);
      setLocalInput(text);
    }
  };

  const filteredProjects = (projects || []).filter((p) =>
    p?.name?.toLowerCase().includes(searchQuery?.toLowerCase() || ""),
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
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 drop-shadow-[0_0_15px_rgba(123,92,234,0.4)]"
          />
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
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-8 custom-scrollbar relative flex flex-col min-h-0"
            style={{ overflowAnchor: "none" }}
          >
            {!messages || messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in duration-1000">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(123,92,234,0.15)]">
                  <Sparkles className="w-10 h-10 text-brand-cyan drop-shadow-[0_0_10px_rgba(0,194,255,0.5)]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                  What are we <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
                    building today?
                  </span>
                </h1>
                <p className="text-brand-text-muted font-medium max-w-lg text-sm md:text-base">
                  Describe your intent, application, story, or workflow. The
                  Imagination Engine will collaborate with you to deconstruct it
                  into a functional blueprint.
                </p>
              </div>
            ) : (
              <div className="space-y-8 pb-12">
                {(messages || []).map((m: any) => {
                  const isAssistant = m?.role !== "user";

                  return (
                    <div
                      key={m?.id || Math.random()}
                      className={`flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500 ${!isAssistant ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div
                        className={`flex items-center gap-2 px-2 ${!isAssistant ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border ${!isAssistant ? "bg-white/5 border-white/10 text-white" : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"}`}
                        >
                          {!isAssistant ? (
                            <ChevronRight size={12} />
                          ) : (
                            <Bot size={12} />
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
                          {!isAssistant ? "Operator" : "Engine"}
                        </span>
                      </div>

                      <div
                        className={`p-6 rounded-3xl text-sm leading-relaxed shadow-2xl ${!isAssistant ? "bg-brand-purple/10 border border-brand-purple/20 text-white rounded-tr-sm" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"}`}
                      >
                        <Markdown content={m?.content || ""} />

                        {(m?.toolInvocations || []).map((tool: any) => {
                          if (tool?.toolName === "generate_canvas_blueprint") {
                            const {
                              blueprint_name,
                              description,
                              nodes,
                              edges,
                            } = tool.args || {};
                            return (
                              <div
                                key={tool?.toolCallId}
                                className="mt-8 p-8 rounded-[32px] bg-black/40 border border-brand-cyan/20 backdrop-blur-2xl group transition-all hover:border-brand-cyan/50 hover:shadow-[0_0_50px_rgba(0,194,255,0.1)] relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple opacity-30 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between mb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shadow-inner">
                                      <LayoutGrid
                                        size={24}
                                        className="text-brand-cyan animate-pulse"
                                      />
                                    </div>
                                    <div>
                                      <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">
                                        {blueprint_name || "Neural Blueprint"}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                          DAG Synthesis Complete
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Sparkles
                                    size={20}
                                    className="text-brand-cyan/40 group-hover:text-brand-cyan transition-colors"
                                  />
                                </div>

                                <p className="text-sm text-brand-text-muted leading-relaxed mb-8 font-medium">
                                  {description ||
                                    "Deconstruction successful. Your imagination is ready for spatial expression."}
                                </p>

                                <div className="flex gap-3 mb-8">
                                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/70">
                                    <span className="text-brand-cyan mr-2">
                                      {nodes?.length || 0}
                                    </span>{" "}
                                    BLOCKS
                                  </div>
                                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/70">
                                    <span className="text-brand-purple mr-2">
                                      {edges?.length || 0}
                                    </span>{" "}
                                    LINKS
                                  </div>
                                </div>

                                <Link
                                  to={`/projects/${tool?.result?.projectId || activeDraftId}`}
                                  className="w-full py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-brand-cyan hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                                >
                                  Initialize Canvas
                                  <ChevronRight
                                    size={16}
                                    className="group-hover/btn:translate-x-1 transition-transform"
                                  />
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
              </div>
            )}

            <div className="pt-4 pb-8">
              {isLoading && <ThinkingBubble />}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs uppercase font-bold animate-in fade-in slide-in-from-bottom-2">
                  Connection Error: {error.message}
                </div>
              )}
            </div>
          </div>

          {/* Input Form */}
          <div className="p-6 bg-white/[0.02] border-t border-white/5">
            <form
              ref={formRef}
              onSubmit={handleChatSubmit}
              className="relative max-w-3xl mx-auto flex items-end group"
            >
              <textarea
                ref={chatInputRef}
                value={localInput}
                onChange={handleInputChange}
                placeholder="Describe your vision..."
                className="w-full bg-white/10 border border-white/20 rounded-[24px] py-4 pl-6 pr-16 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-cyan/50 focus:bg-white/15 transition-all resize-none min-h-[60px] max-h-[200px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={!localInput.trim() || isLoading}
                className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-brand-purple hover:bg-brand-cyan text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:bg-brand-purple group/btn"
              >
                <ArrowUp
                  size={18}
                  strokeWidth={3}
                  className="transition-transform group-hover/btn:-translate-y-1"
                />
              </button>
            </form>
          </div>
        </div>

        {/* Cinematic Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text-muted">
            Dashboard
          </span>
          <ChevronRight className="rotate-90 text-brand-purple" size={12} />
        </div>
      </div>

      {/* --- Section 2: Project Dashboard --- */}
      <div className="min-h-screen bg-brand-bg-page relative px-8 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header Area --- Section 2: Project Dashboard --- */}
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
              <button
                onClick={scrollToChat}
                className="p-3 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-2xl hover:bg-brand-purple hover:text-white transition-all active:scale-95"
              >
                <Plus size={20} />
              </button>
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
              <button
                onClick={scrollToChat}
                className="text-brand-purple text-xs font-black uppercase tracking-widest hover:text-brand-cyan transition-colors"
              >
                Initialize First Node
              </button>
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
    </div>
  );
}
