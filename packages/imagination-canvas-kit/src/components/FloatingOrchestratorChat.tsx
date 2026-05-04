import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, X, GripHorizontal, Minimize2, Send } from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";

export const FloatingOrchestratorChat: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([
    {
      role: "agent",
      content:
        "I am your Canvas Orchestrator. Drag blocks from the library, or tell me what you want to build and I will generate the blueprint.",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const objects = useCanvasStore((s) => s.objects);
  const prevObjectsLength = useRef(
    Array.isArray(objects) ? objects.length : Object.keys(objects).length,
  );

  useEffect(() => {
    const currentLength = Array.isArray(objects)
      ? objects.length
      : Object.keys(objects).length;
    if (currentLength > prevObjectsLength.current) {
      const currentArray = Array.isArray(objects)
        ? objects
        : Object.values(objects);
      const newBlock = currentArray[currentArray.length - 1] as any;

      const blockName = newBlock.metadata?.label || newBlock.type;

      let reaction = "I see you added a " + blockName + " block. ";
      const bnLower = String(blockName).toLowerCase();
      if (bnLower.indexOf("video") !== -1) {
        reaction +=
          "Want this to become a launch reel, cinematic ad, or creator short?";
      } else if (bnLower.indexOf("claw") !== -1) {
        reaction +=
          "Should I sandbox this agent as a builder, researcher, or operator?";
      } else if (bnLower.indexOf("game") !== -1) {
        reaction +=
          "I can connect this Game Runtime to a Storyboard and Asset Generator.";
      } else if (bnLower.indexOf("writer") !== -1) {
        reaction +=
          "That Writers Studio can become the narrative spine of this project.";
      } else {
        reaction += "How should we wire this into the flow?";
      }

      setMessages((prev) => [...prev, { role: "agent", content: reaction }]);
    }
    prevObjectsLength.current = currentLength;
  }, [objects]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            "Processing your request... In a fully wired environment, I would now compile this intent into a DAG and update the canvas.",
        },
      ]);
    }, 1000);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: window.innerWidth - 400, y: 80 }}
      className={
        "absolute z-50 flex flex-col bg-brand-bg-surface/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 " +
        (isMinimized ? "w-64 h-12" : "w-80 h-96")
      }
    >
      <div className="h-12 border-b border-white/5 bg-gradient-to-r from-brand-cyan/10 to-transparent flex items-center justify-between px-3 shrink-0 cursor-grab active:cursor-grabbing group">
        <div className="flex items-center gap-2">
          <GripHorizontal
            size={14}
            className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative">
            <BrainCircuit size={16} className="text-brand-cyan" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-white drop-shadow-md">
            Orchestrator
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Minimize2 size={12} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <React.Fragment>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  "flex flex-col gap-1.5 " +
                  (msg.role === "user" ? "items-end" : "items-start")
                }
              >
                <div className="flex items-center gap-1.5">
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
                    "text-[11px] leading-relaxed p-3 rounded-2xl max-w-[90%] " +
                    (msg.role === "user"
                      ? "bg-white/10 text-white rounded-tr-sm"
                      : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-tl-sm")
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/5 bg-black/20 shrink-0">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask orchestrator to build..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                onPointerDown={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 p-1.5 text-brand-cyan disabled:text-white/20 hover:bg-brand-cyan/10 rounded-lg transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </React.Fragment>
      )}
    </motion.div>
  );
};
