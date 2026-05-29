// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Sparkles,
  Loader2,
  ChevronRight,
  BrainCircuit,
  Zap,
  ChevronLeft,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GrowingTextarea } from "@iem/chat-interaction-kit";
import { Markdown } from "./Markdown";
import { useAuth } from "../../auth/AuthContext";
import {
  useCanvasStore,
  useConnectionStore,
  useViewportStore,
} from "@iem/imagination-canvas-kit";

interface Message {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
}

interface CopilotSidebarProps {
  projectId: string;
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({
  projectId,
}) => {
  const { accessToken, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "I am your AI Architect. Describe your creative goal, and I will deconstruct it into a functional workflow of nodes on the canvas.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addObject, updateObject } = useCanvasStore();
  const { addConnection } = useConnectionStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (customToken?: string, retryContent?: string) => {
    const content = retryContent || input.trim();
    if (!content && !customToken) return;
    if (isLoading && !customToken) return;

    const tokenToUse = customToken || accessToken;
    let userMsg: Message | null = null;

    if (!customToken) {
      userMsg = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content,
      };
      setMessages((prev) => [...prev, userMsg!]);
      setInput("");
    }

    setIsLoading(true);

    try {
      const objects = useCanvasStore.getState().objects;
      const connections = useConnectionStore.getState().connections;

      const canvasContext = {
        nodes: Object.values(objects).map((o: any) => ({
          id: o.id,
          type: o.type,
          label: o.metadata?.label,
          description: o.metadata?.description,
        })),
        edges: Object.values(connections),
      };

      const finalMessages = messages.map((m) => ({
        role: m.role === "agent" ? "assistant" : m.role,
        content: m.content,
      }));

      if (userMsg) {
        finalMessages.push({ role: "user", content: userMsg.content });
      } else if (retryContent) {
        finalMessages.push({ role: "user", content: retryContent });
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse || ""}`,
        },
        credentials: "include",
        body: JSON.stringify({
          sessionId: projectId,
          messages: finalMessages,
          canvasContext,
        }),
      });

      if (res.status === 401 && !customToken) {
        console.log("[Copilot] 401 detected, attempting token refresh...");
        const newToken = await refresh();
        if (newToken) {
          return handleSend(newToken, content);
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const aiMessageId = `msg-ai-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: "assistant", content: "" },
      ]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith("0:")) {
            try {
              let chunk = line.slice(2);
              if (chunk.startsWith('"') && chunk.endsWith('"')) {
                chunk = JSON.parse(chunk);
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: m.content + chunk }
                    : m,
                ),
              );
            } catch (e) {}
          } else if (line.startsWith("9:")) {
            try {
              const toolData = JSON.parse(line.slice(2));
              const args = toolData.args || toolData.result;

              if (toolData.toolName === "generate_canvas_blueprint") {
                if (args?.projectId) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `sys-${Date.now()}`,
                      role: "agent",
                      content:
                        "✨ New project architecture generated. Redirecting...",
                    },
                  ]);
                  setTimeout(() => {
                    window.location.href = `/session/${args.projectId}`;
                  }, 1500);
                }
              } else if (toolData.toolName === "add_block") {
                const viewport = useViewportStore.getState();
                addObject({
                  id: args.id || `block-${Date.now()}`,
                  type: args.type,
                  x: viewport.x + 100 + Math.random() * 50,
                  y: viewport.y + 100 + Math.random() * 50,
                  width: 320,
                  height: 240,
                  zIndex: 1,
                  status: "idle",
                  metadata: {
                    label: args.title,
                    description: args.description,
                    inputs: args.recommended_params || {},
                  },
                });
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `sys-${Date.now()}`,
                    role: "agent",
                    content: `Added block: ${args.title}`,
                  },
                ]);
              } else if (toolData.toolName === "connect_blocks") {
                addConnection({
                  id: `edge-${Date.now()}`,
                  fromId: args.source,
                  toId: args.target,
                  label: args.condition,
                });
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `sys-${Date.now()}`,
                    role: "agent",
                    content: `Connected ${args.source} → ${args.target}`,
                  },
                ]);
              } else if (toolData.toolName === "update_block") {
                updateObject(args.id, {
                  metadata: {
                    label: args.title,
                    description: args.description,
                    inputs: args.params || {},
                  },
                });
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `sys-${Date.now()}`,
                    role: "agent",
                    content: `Updated block: ${args.id}`,
                  },
                ]);
              }
            } catch (e) {
              console.error("Tool execution failed:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "agent",
          content: "Connection to Copilot lost.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full flex shrink-0 z-30">
      {/* Toggle Button (When Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white hover:text-brand-purple hover:border-brand-purple/30 transition-all group pointer-events-auto flex flex-col items-center gap-2"
        >
          <BrainCircuit
            size={20}
            className="text-brand-purple group-hover:scale-110 transition-transform"
          />
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ writingMode: "vertical-rl" }}
          >
            Open Copilot
          </span>
        </button>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-[320px] h-full border-l border-white/5 bg-brand-bg-surface/50 backdrop-blur-3xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-brand-purple/10 to-transparent shrink-0">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-brand-purple" />
                <span className="font-black text-[10px] tracking-widest uppercase text-white/80">
                  Copilot
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("iem:run-graph"));
                  }}
                  className="p-1.5 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 transition-colors"
                  title="Run Graph"
                >
                  <Zap size={14} fill="currentColor" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 px-1">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest ${msg.role === "user" ? "text-white/40" : "text-brand-purple"}`}
                    >
                      {msg.role === "user" ? "You" : "Engine"}
                    </span>
                  </div>
                  <div
                    className={`text-[12px] leading-relaxed p-3.5 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-brand-purple text-white rounded-tr-sm"
                        : msg.role === "agent"
                          ? "bg-white/5 border border-white/10 text-brand-cyan font-bold italic rounded-tl-sm"
                          : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                    }`}
                  >
                    <Markdown content={msg.content} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-brand-purple p-2 animate-pulse">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Thinking...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
              <div className="relative group">
                <GrowingTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe goal..."
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-purple transition-all pr-10 resize-none custom-scrollbar text-white placeholder:text-white/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-3 p-2 text-brand-purple hover:text-brand-cyan transition-colors disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[8px] text-center text-white/20 uppercase tracking-[0.2em] font-black mt-3">
                Shift + Enter for new line
              </p>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2 shrink-0">
              <Sparkles size={10} className="text-brand-purple/50" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                Sovereign Intel
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
