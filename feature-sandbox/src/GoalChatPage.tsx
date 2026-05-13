import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflowStore } from "./store";
import { chatAboutGoal, generateWorkflowPlan } from "./ai";
import { Send, ArrowRight, Bot, User } from "lucide-react";

export default function GoalChatPage() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { goalMessages, addGoalMessage, setGoal, setNodes, setEdges } =
    useWorkflowStore();
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!input.trim() || isTyping || isGenerating) return;

    const userMessage = input;
    addGoalMessage({ role: "user", content: userMessage });
    setInput("");
    setGoal(userMessage); // Track the latest intent

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
    const { goal } = useWorkflowStore.getState();
    setIsGenerating(true);

    try {
      const plan = await generateWorkflowPlan(goal);

      const formattedNodes = plan.nodes.map((n: any, idx: number) => ({
        id: n.id,
        position: { x: 250, y: 50 + idx * 100 },
        data: { label: n.label, instruction: n.instruction },
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
      alert("Failed to generate plan. Check API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-6">
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 custom-scrollbar">
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
              className={`px-5 py-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-brand-purple text-white" : "bg-brand-surface border border-white/10"}`}
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
          <div className="text-white/50 text-sm ml-12 animate-pulse">
            Agent is typing...
          </div>
        )}
      </div>

      <div className="flex-none space-y-4">
        {goalMessages.length > 2 && (
          <button
            onClick={handleGenerateWorkflow}
            disabled={isGenerating || isTyping}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating
              ? "Synthesizing Nodes via Gemini..."
              : "Generate Workflow"}{" "}
            <ArrowRight size={18} />
          </button>
        )}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="I want to build a..."
            disabled={isGenerating || isTyping}
            className="w-full bg-brand-surface border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-brand-purple transition-colors pr-14 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 transition-colors cursor-pointer"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
