import React, { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "../../auth/AuthContext";
import { Markdown } from "./Markdown";
import { Bot, ChevronRight, ArrowUp } from "lucide-react";

interface ChatShellProps {
  projectId: string;
  initialMessages?: any[];
  fullScreen?: boolean;
}

export const ChatShell: React.FC<ChatShellProps> = ({
  projectId,
  initialMessages = [],
  fullScreen = false,
}) => {
  const { accessToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "http://localhost:3001/api/chat",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: {
        sessionId: projectId,
      },
      initialMessages: initialMessages as any,
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex flex-col bg-brand-bg-surface border border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl transition-all duration-500 ease-in-out ${fullScreen ? "w-full h-full" : "w-[450px] h-[80vh] rounded-3xl"}`}
    >
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative flex flex-col space-y-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-brand-text-muted">
            <Bot size={40} className="mb-4 opacity-50" />
            <p className="text-sm">Initiate orchestration.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isAssistant = m.role !== "user";
            return (
              <div
                key={m.id}
                className={`flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${!isAssistant ? "ml-auto items-end max-w-[85%]" : "mr-auto items-start w-full"}`}
              >
                <div
                  className={`flex items-center gap-2 px-2 ${!isAssistant ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${!isAssistant ? "bg-white/5 border-white/10 text-white" : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"}`}
                  >
                    {!isAssistant ? (
                      <ChevronRight size={10} />
                    ) : (
                      <Bot size={10} />
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
                    {!isAssistant ? "Operator" : "Engine"}
                  </span>
                </div>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${!isAssistant ? "bg-brand-purple/10 border border-brand-purple/20 text-white rounded-tr-sm" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm w-full"}`}
                >
                  <Markdown content={m.content} />
                  {/* Tool invocations mapping */}
                  {m.toolInvocations?.map((tool: any, idx: number) => (
                    <div
                      key={idx}
                      className="mt-4 p-3 rounded-xl bg-black/40 border border-brand-cyan/20 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                        Executing: {tool.toolName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-brand-cyan animate-pulse py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">
              Agent is thinking...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-xs font-bold uppercase text-center">
          Connection Error: {error.message}
        </div>
      )}

      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-end group">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Instruct the engine..."
            className="w-full bg-white/10 border border-white/20 rounded-[20px] py-3 pl-5 pr-14 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-cyan/50 focus:bg-white/15 transition-all resize-none text-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-brand-purple hover:bg-brand-cyan text-white rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-brand-purple"
          >
            <ArrowUp size={16} strokeWidth={3} />
          </button>
        </form>
      </div>
    </div>
  );
};
