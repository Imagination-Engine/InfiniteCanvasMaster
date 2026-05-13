import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflowStore } from "./store";
import { Send, ArrowRight, Bot, User } from "lucide-react";

export default function GoalChatPage() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { goalMessages, addGoalMessage, setGoal, setNodes, setEdges } =
    useWorkflowStore();
  const navigate = useNavigate();

  const handleSend = () => {
    if (!input.trim()) return;
    addGoalMessage({ role: "user", content: input });
    setInput("");

    // Mock Agent Response
    setTimeout(() => {
      addGoalMessage({
        role: "agent",
        content: `Got it. Let's build a workflow for that. When you are ready, click "Generate Workflow".`,
      });
      setGoal(input); // Save the last user intent as the main goal
    }, 1000);
  };

  const handleGenerateWorkflow = () => {
    setIsGenerating(true);
    // Mock Gemini generating nodes based on the goal
    setTimeout(() => {
      setNodes([
        {
          id: "1",
          type: "default",
          position: { x: 250, y: 50 },
          data: { label: "Input Configuration" },
        },
        {
          id: "2",
          type: "default",
          position: { x: 250, y: 150 },
          data: { label: "LLM Processing" },
        },
        {
          id: "3",
          type: "output",
          position: { x: 250, y: 250 },
          data: { label: "Output Generator" },
        },
      ]);
      setEdges([
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
      ]);
      setIsGenerating(false);
      navigate("/workflow");
    }, 2000);
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
              <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Bot size={18} />
              </div>
            )}
            <div
              className={`px-5 py-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-brand-purple text-white" : "bg-brand-surface border border-white/10"}`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-none space-y-4">
        {goalMessages.length > 2 && (
          <button
            onClick={handleGenerateWorkflow}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isGenerating ? "Synthesizing Nodes..." : "Generate Workflow"}{" "}
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
            className="w-full bg-brand-surface border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-brand-purple transition-colors pr-14"
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
