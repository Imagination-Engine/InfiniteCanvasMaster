import React, { useRef, useState, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "../../auth/AuthContext";
import { Markdown } from "./Markdown";
import { Bot, ChevronRight, ArrowUp, Square, ChevronDown } from "lucide-react";
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
  blockId?: string; // Added for specialized block agent chat
  initialMessages?: any[];
  fullScreen?: boolean;
  apiEndpoint?: string; // Allow overriding the default API
}

export const ChatShell: React.FC<ChatShellProps> = (props) => {
  const { accessToken, loading } = useAuth();

  // 1. Wait for auth to be resolved to prevent 401 on initial handshake
  if (loading || !accessToken) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-brand-bg-surface/50">
        <div className="w-8 h-8 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          Authenticating Engine...
        </p>
      </div>
    );
  }

  // 2. FORCE RE-INITIALIZATION: Use a unique key based on block/project/token
  // This ensures that useChat (which can be non-reactive to option changes)
  // always has the latest config when the context shifts.
  const instanceKey = `${props.projectId}-${props.blockId || "main"}-${accessToken.slice(-8)}`;

  return (
    <ChatInternal {...props} key={instanceKey} accessToken={accessToken} />
  );
};

/**
 * Internal Chat Component: Handles the actual useChat hook logic.
 * Isolate here so it can be completely unmounted/remounted by the parent's key.
 */
const ChatInternal: React.FC<ChatShellProps & { accessToken: string }> = ({
  projectId,
  blockId,
  initialMessages = [],
  fullScreen = false,
  apiEndpoint = "/api/chat",
  accessToken,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const objects = useCanvasStore((s) => s.objects);
  const connections = useConnectionStore((s) => s.connections);

  // Determine final API endpoint based on blockId
  const baseApi = blockId ? `${apiEndpoint}/block` : apiEndpoint;

  // ROBUST AUTH FALLBACK: Use query param as tertiary fallback for standard fetch handlers
  const finalApi = `${baseApi}?token=${accessToken}`;

  // LOCAL STATE OVERRIDE for input to bypass SDK synchronization issues
  const [localInput, setLocalInput] = useState("");

  const chatResult = useChat({
    api: finalApi,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      sessionId: projectId,
      projectId,
      blockId,
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

  // ROBUST PROPERTY RESOLUTION
  const isArray = Array.isArray(chatResult);
  const messages = isArray ? chatResult[0] : chatResult.messages || [];
  const status = !isArray ? (chatResult as any).status : undefined;
  const isLoading = isArray
    ? chatResult[4]
    : chatResult.isLoading ||
      status === "loading" ||
      status === "streaming" ||
      status === "submitting" ||
      false;
  const error = isArray ? chatResult[5] : chatResult.error;

  const stop = isArray
    ? chatResult[6]
    : chatResult.stop || (chatResult as any).abort || (() => {});

  const append = isArray
    ? chatResult[7]
    : chatResult.append ||
      (chatResult as any).sendMessage ||
      (chatResult as any).handleSubmit ||
      (chatResult as any).onSubmit;

  const handleManualSubmit = async (e?: any) => {
    if (e?.preventDefault) e.preventDefault();
    const content = localInput.trim();
    if (!content || isLoading) return;

    console.log("[CHAT-SHELL] Manual submit triggered:", {
      projectId,
      blockId,
      finalApi: finalApi.split("?")[0],
      hasToken: !!accessToken,
      isLoading,
      status,
    });

    try {
      setLocalInput(""); // Clear immediately for UX

      if (typeof append === "function") {
        if ((chatResult as any).sendMessage) {
          await (append as any)({
            role: "user",
            content,
          });
        } else {
          await append({
            role: "user",
            content,
          } as any);
        }
      } else {
        throw new Error(
          `No submission handler found. Keys: ${isArray ? "array" : Object.keys(chatResult).join(", ")}`,
        );
      }
    } catch (err) {
      console.error("[CHAT-SHELL] Manual submit failed:", err);
      setLocalInput(content); // Restore on failure
    }
  };

  // Automatically scroll to bottom as new messages stream in
  useAutoScroll(messagesEndRef, [messages, isLoading, error]);

  const { handleKeyDown, handleButtonClick } = useComposerSubmit({
    onSubmit: handleManualSubmit,
    onStop: stop as any,
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
          messages.map((m: any) => {
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
        <form
          onSubmit={handleManualSubmit}
          className="flex items-end group w-full"
        >
          <GrowingTextarea
            value={localInput}
            onChange={(e) => {
              console.log("[CHAT-SHELL] Local Input change:", e.target.value);
              setLocalInput(e.target.value);
            }}
            placeholder="Instruct the engine..."
            onKeyDown={handleKeyDown as any}
            onEnter={() => {
              console.log("[CHAT-SHELL] Enter pressed");
              handleManualSubmit();
            }}
            onFileSelect={(files) => console.log("Files selected:", files)}
            actions={
              <button
                type="submit"
                disabled={!localInput.trim() && !isLoading}
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
