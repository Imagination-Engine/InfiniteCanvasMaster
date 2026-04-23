import React, { useEffect, useState, useRef } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useSessionStore } from "../../store/useSessionStore";
import {
  Bot,
  Minimize2,
  Maximize2,
  X,
  Sparkles,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { Markdown } from "./Markdown";

interface ChatShellProps {
  projectId: string;
  initialMessages?: UIMessage[];
  fullScreen?: boolean;
}

const ThinkingBubble = () => (
  <div className="flex items-center gap-2 text-brand-purple/50 animate-pulse py-2">
    <Terminal size={14} />
    <span className="text-[10px] font-black uppercase tracking-widest italic">
      Neural Engine Processing...
    </span>
  </div>
);

export const ChatShell: React.FC<ChatShellProps> = ({
  projectId,
  initialMessages = [],
  fullScreen = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    append,
    status,
  } = useChat({
    api: "/api/chat",
    body: { sessionId: projectId },
    initialMessages,
  } as any) as any;

  // Bottom-anchor scroll strategy
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Handle manual scroll to disable/enable auto-scroll
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  }, []);

  // Observe container size changes (e.g. as tokens stream in)
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

  // Scroll on new messages
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom("smooth");
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // Initial Deconstruction trigger
  // If there's an initial message (the story) but no assistant response yet, we trigger the AI
  useEffect(() => {
    if (
      initialMessages.length === 1 &&
      initialMessages[0].role === "user" &&
      messages.length === 1
    ) {
      // The AI hasn't responded to the story yet, let's append a silent trigger or just let the backend handle it.
      // Wait, if the backend didn't auto-respond, we can trigger it here by reloading or appending.
      // Actually, the backend should ideally auto-respond on project creation, but since it didn't,
      // we can append a hidden trigger or just call `reload()`.
      // The simplest way to trigger the first response is just sending a hidden prompt or
      // relying on the user. Let's send a system prompt asking to deconstruct.

      append({
        id: Date.now().toString(),
        role: "user",
        content: "Please deconstruct my story and suggest canvas blocks.",
      });
    }
  }, [initialMessages.length, messages.length, append]);

  // Detect tool calls in messages to trigger lazy canvas creation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "assistant" &&
      (lastMessage as any).toolInvocations?.length > 0
    ) {
      if (!hasCanvas) {
        setHasCanvas(true);
      }
    }
  }, [messages, hasCanvas, setHasCanvas]);

  if (!isOpen && !fullScreen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-brand-bg-surface border border-white/10 rounded-full shadow-2xl hover:bg-white/5 transition-all text-brand-purple group z-50"
      >
        <Bot size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  const containerClasses = fullScreen
    ? "flex flex-col bg-brand-bg-page h-full w-full max-w-4xl mx-auto"
    : `fixed right-6 z-50 flex flex-col bg-brand-bg-surface/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
        isMinimized ? "bottom-6 w-80 h-16" : "bottom-6 top-24 w-96"
      }`;

  return (
    <div className={containerClasses}>
      {/* Header - Only show in floating mode or if we want a title in full screen */}
      {!fullScreen && (
        <div
          className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={16} className="text-brand-purple" />
            <h3 className="font-bold text-sm tracking-wide">
              Imagination Engine
            </h3>
          </div>
          <div className="flex items-center gap-2 text-brand-text-muted">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="hover:text-white transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="hover:text-rose-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Header */}
      {fullScreen && (
        <div className="flex flex-col items-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shadow-[0_0_30px_rgba(123,92,234,0.2)]">
            <Bot size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white">
            Neural Interface
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-text-muted">
            Imagination Engine v1.0.0
          </p>
        </div>
      )}

      {/* Body */}
      {(!isMinimized || fullScreen) && (
        <>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            data-testid="message-list"
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-brand-text-muted space-y-4 opacity-50">
                <Bot size={48} />
                <p className="text-sm uppercase tracking-widest font-bold">
                  Awaiting Input...
                </p>
              </div>
            )}

            {messages.map((m: any) => {
              if (
                m?.content ===
                "Please deconstruct my story and suggest canvas blocks."
              )
                return null;

              const isAssistant = m?.role !== "user";

              return (
                <div
                  key={m?.id}
                  className={`group relative flex flex-col gap-2 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                    !isAssistant ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  {/* Avatar / Label */}
                  <div
                    className={`flex items-center gap-2 mb-1 px-2 ${!isAssistant ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                        !isAssistant
                          ? "bg-white/5 border-white/10 text-white"
                          : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
                      }`}
                    >
                      {!isAssistant ? (
                        <ChevronRight size={12} />
                      ) : (
                        <Bot size={12} />
                      )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
                      {!isAssistant ? "Operator" : "Engine Core"}
                    </span>
                  </div>

                  <div
                    className={`p-6 rounded-3xl text-sm leading-relaxed shadow-2xl transition-all ${
                      !isAssistant
                        ? "bg-brand-purple/10 border border-brand-purple/20 text-white rounded-tr-sm shadow-brand-purple/5"
                        : "bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-sm"
                    }`}
                  >
                    <Markdown content={m?.content || ""} />

                    {/* Tool Invocations / Suggestions */}
                    {m.toolInvocations?.map((toolInvocation: any) => {
                      const { toolName, toolCallId, state, args } =
                        toolInvocation;

                      if (toolName === "generate_canvas_blueprint") {
                        const isResolved = state === "result";

                        return (
                          <div
                            key={toolCallId}
                            className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl group/tool transition-all hover:border-brand-purple/30"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-purple">
                                  Blueprint Synthesis
                                </span>
                              </div>
                              <Sparkles
                                size={12}
                                className="text-brand-purple opacity-50 group-hover/tool:opacity-100 transition-opacity"
                              />
                            </div>
                            <h4 className="text-white font-bold text-sm mb-1">
                              {args.blueprint_name}
                            </h4>
                            <p className="text-[11px] text-brand-text-muted leading-relaxed mb-3">
                              {args.description}
                            </p>

                            <div className="flex gap-2 mb-5 flex-wrap">
                              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-white/50">
                                {args.nodes?.length || 0} Nodes
                              </span>
                              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-white/50">
                                {args.edges?.length || 0} Edges
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("iem:apply-blueprint", {
                                    detail: args,
                                  }),
                                );
                              }}
                              className="w-full py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-purple/20 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                            >
                              Deploy Blueprint to Substrate
                              <ChevronRight
                                size={12}
                                className="group-hover/btn:translate-x-0.5 transition-transform"
                              />
                            </button>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              );
            })}
            {status === "loading" && (
              <div className="mr-auto">
                <ThinkingBubble />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className={`p-6 ${fullScreen ? "" : "border-t border-white/10 bg-white/5"}`}
          >
            <div className="relative flex items-center max-w-2xl mx-auto w-full group">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={
                  fullScreen ? "Manifest your intent..." : "Ask the engine..."
                }
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all shadow-2xl ${fullScreen ? "text-lg" : ""}`}
              />
              <button
                type="submit"
                disabled={!input?.trim()}
                className="absolute right-3 p-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:hover:bg-brand-purple"
              >
                <Bot size={20} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
