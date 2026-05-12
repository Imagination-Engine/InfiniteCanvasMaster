// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, X, Send, Sparkles, Loader2 } from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";
import { useViewportStore } from "../state/viewportStore";
import { useExpansionStore } from "../state/expansionStore";
import { GrowingTextarea } from "@iem/chat-interaction-kit";
import { useOrchestratorContext } from "../hooks/useOrchestratorContext";
import { Markdown } from "../../../apps/web/src/Components/Chat/Markdown";

export const FloatingOrchestratorChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedBlock, lastDroppedBlock, sessionContext } =
    useOrchestratorContext();

  const [messages, setMessages] = useState<any[]>([
    {
      id: "msg-1",
      role: "agent",
      content:
        "I am your Canvas Orchestrator. Tell me how to change your graph or wire up nodes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addObject = useCanvasStore((s) => s.addObject);
  const updateObject = useCanvasStore((s) => s.updateObject);
  const addConnection = useConnectionStore((s) => s.addConnection);

  useEffect(() => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === "function"
    ) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      } catch (e) {}
    }
  }, [messages, isOpen]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
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

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify({
          sessionId: `canvas-mutation-${Date.now()}`,
          isDraft: true,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          canvasContext,
        }),
      });

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

              if (
                toolData.toolName === "add_block" ||
                toolData.result?.action === "add_block"
              ) {
                const args = toolData.args || toolData.result;
                const viewport = useViewportStore.getState();
                const vw = viewport.width || 1000;
                const vh = viewport.height || 1000;

                addObject({
                  id: args.id || `block-${Date.now()}`,
                  type: args.type || "iem.scribe.prose",
                  x:
                    viewport.x +
                    vw / 2 / viewport.zoom -
                    150 +
                    Math.random() * 50,
                  y:
                    viewport.y +
                    vh / 2 / viewport.zoom -
                    100 +
                    Math.random() * 50,
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
              } else if (
                toolData.toolName === "connect_blocks" ||
                toolData.result?.action === "connect_blocks"
              ) {
                const args = toolData.args || toolData.result;
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
                    content: `Connected ${args.source} -> ${args.target}`,
                  },
                ]);
              } else if (
                toolData.toolName === "update_block" ||
                toolData.result?.action === "update_block"
              ) {
                const args = toolData.args || toolData.result;
                const currentObj = useCanvasStore.getState().objects[args.id];
                if (currentObj) {
                  updateObject(args.id, {
                    metadata: {
                      ...currentObj.metadata,
                      label: args.title || currentObj.metadata.label,
                      description:
                        args.description || currentObj.metadata.description,
                      inputs: {
                        ...(currentObj.metadata.inputs || {}),
                        ...(args.params || {}),
                      },
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
              }
            } catch (e) {
              console.error(e);
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
          content: "Sorry, I lost connection to the Orchestrator.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const { activeExpansionId } = useExpansionStore();
  const isExpanded = !!activeExpansionId;

  return (
    <React.Fragment>
      {!isOpen && !isExpanded && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[10006] p-3 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors group pointer-events-auto"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex flex-col items-center gap-2">
            <BrainCircuit size={20} className="text-brand-cyan" />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ writingMode: "vertical-rl" }}
            >
              Agent
            </span>
          </div>
        </button>
      )}

      <AnimatePresence>
        {isOpen && !isExpanded && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            style={{ width: "500px", minWidth: "500px", maxWidth: "500px" }}
            className="absolute right-0 top-0 bottom-0 bg-brand-bg-page/95 backdrop-blur-3xl border-l border-white/10 z-[10005] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="h-14 border-b border-white/5 bg-gradient-to-r from-brand-cyan/10 to-transparent flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2 text-brand-cyan">
                <BrainCircuit size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest text-white">
                  Orchestrator
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6 w-full">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={
                      "flex flex-col gap-2 w-full " +
                      (msg.role === "user" ? "items-end" : "items-start")
                    }
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      <span
                        className={
                          "text-[8px] font-black uppercase tracking-widest " +
                          (msg.role === "user"
                            ? "text-white/40"
                            : "text-brand-cyan")
                        }
                      >
                        {msg.role === "user" ? "You" : "Canvas AI"}
                      </span>
                    </div>

                    <div
                      className={
                        "text-[13px] leading-relaxed p-4 rounded-2xl shadow-sm break-words overflow-hidden " +
                        (msg.role === "user"
                          ? "bg-white/10 text-white rounded-tr-sm"
                          : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-tl-sm")
                      }
                      style={{ maxWidth: "100%", wordBreak: "break-word" }}
                    >
                      <Markdown content={msg.content} />
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div className="flex items-center gap-2 text-brand-cyan p-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Orchestrator Thinking...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-4 shrink-0" />
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40 shrink-0 w-full">
              <GrowingTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask agent to mutate canvas..."
                onEnter={handleSubmit}
                className="bg-transparent border-none"
                maxHeight={150}
                actions={
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 flex items-center justify-center text-brand-cyan disabled:text-white/20 hover:bg-brand-cyan/10 rounded-xl transition-colors"
                  >
                    <Send size={18} />
                  </button>
                }
              />
              <div className="mt-3 flex items-center justify-center gap-2 opacity-50">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <Sparkles size={10} className="text-brand-cyan" />
                  <span>Sovereign Engine Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};
