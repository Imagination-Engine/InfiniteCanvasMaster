import { useState } from "react";
import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "./store";
import { chatAboutGoal, generateWorkflowPlan, executeWorkflowNode } from "./ai";
import { Send, Play, Download, Bot, User, Code, FileText } from "lucide-react";

export default function WorkflowPage() {
  const {
    goal,
    modifications,
    setModifications,
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNodeOutput,
    refineMessages,
    addRefineMessage,
    artifacts,
    addArtifact,
    clearArtifacts,
  } = useWorkflowStore();
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput;
    addRefineMessage({ role: "user", content: userMessage });
    setChatInput("");
    setModifications(userMessage);

    setIsTyping(true);
    try {
      const reply = await chatAboutGoal(userMessage, true);
      addRefineMessage({ role: "agent", content: reply });

      // Re-generate the workflow based on the updated constraints
      addRefineMessage({
        role: "agent",
        content: "Re-synthesizing workflow graph...",
      });
      const newPlan = await generateWorkflowPlan(
        goal,
        modifications + " " + userMessage,
      );

      const formattedNodes = newPlan.nodes.map((n: any, idx: number) => ({
        id: n.id,
        position: { x: 250, y: 50 + idx * 100 },
        data: { label: n.label, instruction: n.instruction },
      }));
      setNodes(formattedNodes);
      setEdges(
        newPlan.edges.map((e: any) => ({
          id: `e${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
        })),
      );

      addRefineMessage({ role: "agent", content: "Workflow updated!" });
    } catch (e) {
      addRefineMessage({
        role: "agent",
        content: "Failed to update workflow.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    clearArtifacts();

    // Create a topological execution order (simplistic assumption: sequential IDs or edge following)
    // For this prototype, we'll just follow the nodes array order as returned by the LLM
    let context = "";

    for (const node of nodes) {
      setActiveNode(node.id);
      try {
        const result = await executeWorkflowNode(
          node.data.label,
          node.data.instruction,
          context,
        );

        if (result.artifactContent) {
          addArtifact({
            name:
              result.artifactName ||
              `${node.data.label.replace(/\s+/g, "_")}.txt`,
            content:
              typeof result.artifactContent === "string"
                ? result.artifactContent
                : JSON.stringify(result.artifactContent, null, 2),
            type: result.type || "text",
          });

          context += `\nOutput from ${node.data.label}:\n${typeof result.artifactContent === "string" ? result.artifactContent : JSON.stringify(result.artifactContent)}`;
          updateNodeOutput(node.id, "Success");
        }
      } catch (e) {
        updateNodeOutput(node.id, "Failed");
        console.error(e);
        break; // stop on error
      }
    }

    setActiveNode(null);
    setIsRunning(false);
  };

  const downloadContent = (name: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayNodes = nodes.map((n) => ({
    ...n,
    style: {
      background: activeNode === n.id ? "#7b5cea" : "#18181f",
      color: "white",
      border:
        activeNode === n.id
          ? "2px solid white"
          : "1px solid rgba(255,255,255,0.2)",
      padding: "10px 15px",
      borderRadius: "8px",
      width: 250,
      opacity:
        isRunning && activeNode !== n.id && n.data.output !== "Success"
          ? 0.5
          : 1,
    },
    data: {
      ...n.data,
      label: (
        <div className="flex flex-col gap-1">
          <div className="font-bold text-sm">{n.data.label}</div>
          <div className="text-[10px] text-white/50">{n.data.instruction}</div>
          {n.data.output && (
            <div className="text-[10px] text-green-400 mt-1">
              {n.data.output}
            </div>
          )}
        </div>
      ),
    },
  }));

  return (
    <div className="flex h-screen w-full bg-brand-bg overflow-hidden">
      {/* Left Rail: Refinement Chat */}
      <div className="w-[350px] border-r border-white/10 bg-brand-surface flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-white/10 font-bold tracking-wider uppercase text-xs text-white/50">
          Workflow Copilot
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {refineMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "agent" && (
                <div className="mt-1 shrink-0">
                  <Bot size={14} className="text-brand-purple" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-brand-purple text-white" : "bg-white/5 border border-white/10 text-white/90"} whitespace-pre-wrap`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-white/50 text-xs ml-8 animate-pulse">
              Processing...
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/10 relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            placeholder="Change the workflow..."
            disabled={isTyping || isRunning}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-brand-purple transition-colors pr-10 disabled:opacity-50"
          />
          <button
            onClick={handleSendChat}
            disabled={isTyping || isRunning}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-purple hover:text-white transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Center: Node Canvas */}
      <div className="flex-1 relative bg-brand-bg min-w-[300px]">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning || isTyping}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-cyan text-black font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isRunning ? "Executing..." : "Run Workflow"}{" "}
            <Play size={16} fill="currentColor" />
          </button>
        </div>
        <ReactFlow nodes={displayNodes} edges={edges} fitView>
          <Background color="#ffffff" gap={24} size={1} opacity={0.05} />
          <Controls className="!bg-brand-surface !border-white/10 !fill-white" />
        </ReactFlow>
      </div>

      {/* Right Rail: Artifacts */}
      <div className="w-[350px] border-l border-white/10 bg-brand-surface flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-white/10 font-bold tracking-wider uppercase text-xs text-white/50">
          Generated Output
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {artifacts.length === 0 ? (
            <div className="text-center text-white/30 text-sm mt-10">
              {isRunning
                ? "Waiting for artifacts..."
                : "Run the workflow to generate files."}
            </div>
          ) : (
            artifacts.map((art, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-white/10 shrink-0">
                      {art.type === "code" ? (
                        <Code size={14} className="text-brand-cyan" />
                      ) : (
                        <FileText size={14} className="text-brand-purple" />
                      )}
                    </div>
                    <span className="text-sm font-bold truncate">
                      {art.name}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadContent(art.name, art.content)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white/90"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                </div>
                <div className="bg-black/30 rounded p-2 text-xs font-mono text-white/70 max-h-32 overflow-hidden relative">
                  {art.content.slice(0, 200)}...
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
