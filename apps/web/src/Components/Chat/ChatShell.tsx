import React, { useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "../../auth/AuthContext";
import { Markdown } from "./Markdown";
import { Bot, ChevronRight, ArrowUp, Square } from "lucide-react";
import {
  GrowingTextarea,
  ToolCallBlock,
  useAutoScroll,
  useComposerSubmit,
} from "@iem/chat-interaction-kit";
import {
  useCanvasStore,
  useConnectionStore,
} from "@iem/imagination-canvas-kit";

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
  const { objects } = useCanvasStore();
  const { connections } = useConnectionStore();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useChat({
    api: "http://localhost:3001/api/chat",
  } as any) as any;
  const x = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useChat({
    api: "http://localhost:3001/api/chat",
    api: "http://localhost:3001/api/chat",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: {
      sessionId: projectId,
      canvasContext: {
        nodes: Object.values(objects).map((n: any) => ({
          id: n.id,
          type: n.type,
          data: n.metadata,
        })),
        edges: Object.values(connections),
      },
    },
    initialMessages: initialMessages as any,
  });

  // Automatically scroll to bottom as new messages stream in
  useAutoScroll(messagesEndRef, [messages, isLoading, error]);

  const { handleKeyDown, handleButtonClick } = useComposerSubmit({
    onSubmit: () => handleSubmit(new Event("submit") as any),
    onStop: stop,
    isStreaming: isLoading,
  });

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
                  {/* Native Tool invocations mapping using Kit */}
                  {m.toolInvocations?.map((tool: any, idx: number) => (
                    <ToolCallBlock
                      key={idx}
                      tool={{ ...tool, state: tool.state || "completed" }}
                    />
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
        <div ref={messagesEndRef} className="h-px" />
      </div>

      {error && (
        <div className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-xs font-bold uppercase text-center">
          Connection Error: {error.message}
        </div>
      )}

      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex items-end group w-full">
          <GrowingTextarea
            value={input}
            onChange={handleInputChange}
            placeholder="Instruct the engine..."
            onKeyDown={handleKeyDown as any}
            onEnter={() => handleSubmit(new Event("submit") as any)}
            onFileSelect={(files) => console.log("Files selected:", files)}
            actions={
              <button
                type="button"
                onClick={handleButtonClick}
                disabled={!(input || "").trim() && !isLoading}
                className="w-10 h-10 flex items-center justify-center bg-brand-purple hover:bg-brand-cyan text-white rounded-full transition-all disabled:opacity-50 disabled:hover:bg-brand-purple"
              >
                {isLoading ? (
                  <Square size={14} fill="currentColor" />
                ) : (
                  <ArrowUp
                    size={18}
                    strokeWidth={3}
                    className="transition-transform group-hover:-translate-y-0.5"
                  />
                )}
              </button>
            }
          />
        </form>
      </div>
    </div>
  );
};
