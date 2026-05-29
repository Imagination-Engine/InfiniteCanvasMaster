import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import { Sparkles, ChevronRight, Bot, LayoutGrid, ArrowUp } from "lucide-react";
import { Markdown } from "../Components/Chat/Markdown";
import { GrowingTextarea } from "@iem/chat-interaction-kit";

interface Project {
  id: string;
  name: string;
  surfaceType: string;
  updatedAt: string;
}

const OnboardingCarousel = () => {
  const { completeOnboarding } = useAuth();
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-brand-bg-page/95 backdrop-blur-2xl p-6"
      style={{ isolation: "isolate" }}
    >
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
          className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-brand-cyan hover:text-white transition-all active:scale-95 cursor-pointer pointer-events-auto"
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

export default function StudioPage() {
  const { accessToken, user, logout, refresh } = useAuth();
  const navigate = useNavigate();

  // --- Chat State ---
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [localInput, setLocalInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

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

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = localInput.trim();

    if (!text || isLoading) return;

    setLocalInput("");
    setIsLoading(true);
    setError(null);

    let sessionId = activeDraftId;
    if (!sessionId) {
      sessionId = "draft-" + Date.now();
      setActiveDraftId(sessionId);
    }

    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: text },
    ];
    setMessages(newMessages);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          sessionId,
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: "assistant",
          content: "",
          toolInvocations: [],
        },
      ]);

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const chunk = JSON.parse(line.slice(2));
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: m.content + chunk }
                    : m,
                ),
              );
            } catch (e) {
              console.error("Failed to parse text chunk", line);
            }
          } else if (line.startsWith("9:")) {
            try {
              const toolData = JSON.parse(line.slice(2));
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === aiMessageId) {
                    return {
                      ...m,
                      toolInvocations: [...(m.toolInvocations || []), toolData],
                    };
                  }
                  return m;
                }),
              );
            } catch (e) {
              console.error("Failed to parse tool chunk", line);
            }
          } else if (line.startsWith("3:")) {
            try {
              const errData = JSON.parse(line.slice(2));
              setError(
                new Error(errData.message || "Stream returned an error"),
              );
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error("[UI] Synchronization failure:", err);
      setError(err);
      setLocalInput(text);
    } finally {
      setIsLoading(false);
    }
  };

  const showOnboarding = user && user.hasCompletedOnboarding === false;

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-bg-page relative overflow-hidden">
      {showOnboarding && <OnboardingCarousel />}

      {/* Cinematic Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 py-12 relative overflow-hidden">
        <div className="w-full flex-1 flex flex-col overflow-hidden rounded-[32px] bg-white/[0.02] border border-white/5 shadow-2xl backdrop-blur-xl relative">
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
                {messages.map((m: any) => {
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
                        {isAssistant &&
                        !m?.content &&
                        (m?.toolInvocations || []).length === 0 ? (
                          <p className="text-xs text-brand-text-muted">
                            Engine responded with no text payload.
                          </p>
                        ) : null}

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
                          return (
                            <div
                              key={tool?.toolCallId}
                              className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                            >
                              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-cyan">
                                Tool Executed:{" "}
                                {tool?.toolName || "unknown_tool"}
                              </div>
                              <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap break-words text-[11px] text-brand-text-muted">
                                {JSON.stringify(
                                  tool?.result ?? tool?.args ?? {},
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          );
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

          <div className="p-6 bg-white/[0.02] border-t border-white/5">
            <form
              onSubmit={handleChatSubmit}
              className="max-w-3xl mx-auto flex items-end group"
            >
              <GrowingTextarea
                ref={chatInputRef}
                value={localInput}
                onChange={handleInputChange}
                placeholder="Describe your vision..."
                onEnter={handleChatSubmit}
                onFileSelect={(files) => console.log("Files selected:", files)}
                actions={
                  <button
                    type="submit"
                    disabled={!(localInput || "").trim() || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-brand-purple hover:bg-brand-cyan text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:bg-brand-purple group/btn"
                  >
                    <ArrowUp
                      size={20}
                      strokeWidth={3}
                      className="transition-transform group-hover/btn:-translate-y-0.5"
                    />
                  </button>
                }
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
