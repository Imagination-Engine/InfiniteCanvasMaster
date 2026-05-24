import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkflowStore } from "./store";
import { chatAboutGoal, generateWorkflowPlan, identifyAppType } from "./ai";
import { Send, ArrowRight, Bot, User, LayoutGrid, LogOut } from "lucide-react";
import { supabase } from "./supabase";

export default function GoalChatPage() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const {
    goalMessages,
    addGoalMessage,
    setGoal,
    setNodes,
    setEdges,
    setAppType,
    session,
  } = useWorkflowStore();
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!input.trim() || isTyping || isGenerating) return;

    const userMessage = input;
    addGoalMessage({ role: "user", content: userMessage });
    setInput("");
    setGoal(userMessage);

    setIsTyping(true);
    try {
      const reply = await chatAboutGoal(userMessage);
      addGoalMessage({ role: "agent", content: reply });
    } catch (e) {
      addGoalMessage({ role: "agent", content: "Oops, API error." });
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    const { goal, goalMessages } = useWorkflowStore.getState();
    setIsGenerating(true);

    try {
      // 1. Identify App Type
      const history = goalMessages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");
      const detectedType = await identifyAppType(history);
      setAppType(detectedType);

      // 2. Generate Plan
      const plan = await generateWorkflowPlan(goal, detectedType);

      const formattedNodes = plan.nodes.map((n: any, idx: number) => ({
        id: n.id,
        position: { x: 250, y: 50 + idx * 150 },
        data: {
          label: n.label,
          instruction: n.instruction,
          status: "idle",
        },
      }));

      setNodes(formattedNodes);
      setEdges(
        plan.edges.map((e: any) => ({
          id: `e${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
        })),
      );
      navigate("/workflow");
    } catch (e) {
      console.error(e);
      alert("Failed to generate plan. Check API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-screen bg-brand-bg relative">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-brand-surface/50 backdrop-blur-xl z-20">
        <h1 className="font-black tracking-tighter text-xl">
          IMAGINATION ENGINE
        </h1>
        <div className="flex items-center gap-6">
          <Link
            to="/gallery"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <LayoutGrid size={16} /> Gallery
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 font-mono">
              {session?.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 pt-12">
        <div className="flex-1 overflow-y-auto space-y-6 pb-6 custom-scrollbar pr-2">
          {goalMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "agent" && (
                <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                  <Bot size={18} />
                </div>
              )}
              <div
                className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "bg-brand-purple text-white shadow-lg" : "bg-brand-surface border border-white/10"}`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="text-white/50 text-sm ml-12 animate-pulse flex items-center gap-2">
              <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        <div className="flex-none space-y-4 mt-4">
          {goalMessages.length >= 2 && (
            <button
              onClick={handleGenerateWorkflow}
              disabled={isGenerating || isTyping}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xl shadow-brand-purple/10"
            >
              {isGenerating
                ? "Synthesizing Architecture..."
                : "Generate Workflow"}{" "}
              <ArrowRight size={18} />
            </button>
          )}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="I want to build a..."
              disabled={isGenerating || isTyping}
              className="w-full bg-brand-surface border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-brand-purple/50 focus:bg-black/40 transition-all pr-14 disabled:opacity-50 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isGenerating || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-purple text-white hover:bg-brand-purple/80 transition-colors cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
