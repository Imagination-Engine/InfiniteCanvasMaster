import React, { useEffect, useState, useRef } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSessionStore } from "../../store/useSessionStore";
import { Bot, Minimize2, Maximize2, X, Sparkles } from "lucide-react";

interface ChatShellProps {
  projectId: string;
  initialMessages?: UIMessage[];
}

export const ChatShell: React.FC<ChatShellProps> = ({
  projectId,
  initialMessages = [],
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, error, append } =
    useChat({
      api: "/api/chat",
      body: { sessionId: projectId },
      initialMessages,
    });

  const { hasCanvas, setHasCanvas } = useSessionStore();

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-brand-bg-surface border border-white/10 rounded-full shadow-2xl hover:bg-white/5 transition-all text-brand-purple group z-50"
      >
        <Bot size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div
      className={`fixed right-6 z-50 flex flex-col bg-brand-bg-surface/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
        isMinimized ? "bottom-6 w-80 h-16" : "bottom-6 top-24 w-96"
      }`}
    >
      {/* Header */}
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

      {/* Body */}
      {!isMinimized && (
        <>
          <div
            data-testid="message-list"
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-brand-text-muted space-y-4 opacity-50">
                <Bot size={48} />
                <p className="text-sm">Awaiting your command...</p>
              </div>
            )}

            {messages.map((m) => {
              // Hide the initial deconstruction trigger from UI if we added it
              if (
                m.content ===
                "Please deconstruct my story and suggest canvas blocks."
              )
                return null;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-purple/20 border border-brand-purple/30 ml-auto text-white rounded-tr-sm"
                      : "bg-white/5 border border-white/10 mr-auto text-slate-200 rounded-tl-sm"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-invert prose-sm max-w-none"
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              );
            })}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                Connection error: {error.message}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-white/10 bg-white/5"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask the engine..."
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-purple/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input?.trim()}
                className="absolute right-2 p-1.5 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-brand-purple"
              >
                <Bot size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
