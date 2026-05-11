import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Bot, User, Settings2, Sparkles } from "lucide-react";
import { useEditor } from "tldraw";

interface BlockChatViewProps {
  id: string; // The instance ID (e.g. shape:abcd)
  data: any;
  onChange?: (data: any) => void;
  blockId: string; // The type ID (e.g. iem.conductor.webhook)
}

export const BlockChatView: React.FC<BlockChatViewProps> = ({
  id,
  data,
  onChange,
  blockId,
}) => {
  const editor = useEditor();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    addToolResult,
  } = useChat({
    api: `${import.meta.env.VITE_API_URL}/api/chat`,
    body: {
      sessionId: `block-chat-${id}`,
      blockContext: {
        instanceId: id,
        type: blockId,
        currentData: data,
      },
      canvasContext: {
        nodes: Array.from(editor.getCurrentPageShapeIds()).map((id) =>
          editor.getShape(id),
        ),
        edges: [], // Tldraw edges are different, but we can simplify
      },
    },
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "configure_block") {
        const { params } = toolCall.args as any;
        if (onChange && params) {
          onChange(params);
          return {
            success: true,
            message: "Configuration updated successfully.",
          };
        }
      }
      return { error: "Tool not handled by BlockChat" };
    },
    onError: (err) => {
      console.error("Chat Error:", err);
      setError(err.message);
    },
  });

  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-lg overflow-hidden border border-white/5">
      {/* Header */}
      <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-brand-cyan" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
            Block Assistant {isLoading ? "(Loading...)" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-brand-cyan animate-pulse" : "bg-green-500/50"}`}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-200 text-[9px] px-2 py-1 border-b border-red-500/30">
          Error: {error}
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar min-h-[100px]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-40">
            <Bot className="w-8 h-8 mb-2" />
            <p className="text-[10px]">
              Hi! I'm your block assistant. How can I help you configure this{" "}
              {blockId.split(".").pop()}?
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`
              max-w-[90%] rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed
              ${
                m.role === "user"
                  ? "bg-brand-purple/40 text-white border border-brand-purple/30 rounded-tr-none"
                  : "bg-white/10 text-white/90 border border-white/10 rounded-tl-none"
              }
            `}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          console.log("Form submitted", input);
          e.preventDefault();
          e.stopPropagation();
          if (input.trim() && !isLoading) {
            handleSubmit(e);
          }
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="p-2 bg-black/40 border-t border-white/5 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => {
            e.stopPropagation();
            handleInputChange(e);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && !e.shiftKey) {
              // Allow default form submission
            }
          }}
          onFocus={(e) => e.stopPropagation()}
          placeholder="Ask to configure..."
          className="flex-1 bg-transparent border-none text-[11px] text-white focus:outline-none placeholder:text-white/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1 rounded-md hover:bg-white/10 text-brand-cyan disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
