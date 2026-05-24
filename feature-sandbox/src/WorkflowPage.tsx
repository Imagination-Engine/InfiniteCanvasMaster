import { useState, useMemo } from "react";
import { ReactFlow, Controls, Background, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore, AppNodeData } from "./store";
import { chatAboutGoal, generateWorkflowPlan, executeWorkflowNode } from "./ai";
import {
  Send,
  Play,
  Download,
  Bot,
  Code,
  FileText,
  ChevronRight,
  Save,
  Eye,
  Layout,
  Terminal,
  ExternalLink,
  X,
} from "lucide-react";
import { downloadArtifactsAsZip } from "./zipUtils";
import { supabase } from "./supabase";

export default function WorkflowPage() {
  const {
    goal,
    appType,
    modifications,
    setModifications,
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNodeData,
    refineMessages,
    addRefineMessage,
    artifacts,
    addArtifact,
    clearArtifacts,
    currentProjectId,
    setCurrentProjectId,
  } = useWorkflowStore();

  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

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
      const newPlan = await generateWorkflowPlan(
        goal,
        appType,
        modifications + " " + userMessage,
      );
      const formattedNodes = newPlan.nodes.map((n: any, idx: number) => {
        const existing = nodes.find((en) => en.id === n.id);
        return {
          id: n.id,
          position: existing?.position || { x: 250, y: 50 + idx * 150 },
          data: {
            label: n.label,
            instruction: n.instruction,
            status: existing?.data.status || "idle",
            output: existing?.data.output,
            input: existing?.data.input,
          },
        };
      });
      setNodes(formattedNodes);
      setEdges(
        newPlan.edges.map((e: any) => ({
          id: `e${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
        })),
      );
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
    let currentInput = "";

    for (const node of nodes) {
      updateNodeData(node.id, { status: "running" });
      try {
        const result = await executeWorkflowNode(
          node.data.label,
          node.data.instruction,
          currentInput,
        );

        addArtifact({
          name: result.artifactName,
          content: result.artifactContent,
          type: result.type,
        });

        currentInput = result.artifactContent;
        updateNodeData(node.id, {
          status: "success",
          output: result.artifactContent,
          input: node.data.input || currentInput, // store what went in
        });
      } catch (e) {
        updateNodeData(node.id, { status: "failed" });
        console.error(e);
        break;
      }
    }
    setIsRunning(false);
  };

  const handleSaveProject = async () => {
    const { session } = useWorkflowStore.getState();
    if (!session) return;

    const projectData = {
      user_id: session.user.id,
      goal,
      app_type: appType,
      nodes,
      edges,
      updated_at: new Date(),
    };

    if (currentProjectId) {
      await supabase
        .from("projects")
        .update(projectData)
        .eq("id", currentProjectId);
    } else {
      const { data } = await supabase
        .from("projects")
        .insert([projectData])
        .select();
      if (data) setCurrentProjectId(data[0].id);
    }
    alert("Project saved!");
  };

  const webPreviewContent = useMemo(() => {
    if (appType !== "WEB") return null;
    const html = artifacts.find((a) => a.name.endsWith(".html"))?.content || "";
    const css = artifacts.find((a) => a.name.endsWith(".css"))?.content || "";
    const js = artifacts.find((a) => a.name.endsWith(".js"))?.content || "";

    return `
      <html>
        <head>
          <style>${css}</style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
  }, [artifacts, appType]);

  const displayNodes = nodes.map((n) => ({
    ...n,
    style: {
      background: selectedNodeId === n.id ? "#7b5cea" : "#18181f",
      color: "white",
      border:
        selectedNodeId === n.id
          ? "2px solid white"
          : "1px solid rgba(255,255,255,0.1)",
      padding: "12px",
      borderRadius: "12px",
      width: 220,
      boxShadow:
        selectedNodeId === n.id ? "0 0 20px rgba(123, 92, 234, 0.3)" : "none",
    },
    data: {
      ...n.data,
      label: (
        <div
          className="flex flex-col gap-1 cursor-pointer"
          onClick={() => setSelectedNodeId(n.id)}
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs uppercase tracking-wider">
              {n.data.label}
            </div>
            {n.data.status === "running" && (
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
            )}
            {n.data.status === "success" && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </div>
          <div className="text-[10px] text-white/40 line-clamp-2 mt-1">
            {n.data.instruction}
          </div>
        </div>
      ),
    },
  }));

  return (
    <div className="flex h-screen w-full bg-brand-bg overflow-hidden text-white">
      {/* Left: Chat */}
      <div className="w-[320px] border-r border-white/5 bg-brand-surface flex flex-col z-20">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="font-black text-xs tracking-widest uppercase text-white/40">
            Copilot
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-brand-${appType === "WEB" ? "cyan" : "purple"}`}
          >
            {appType}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {refineMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.role === "user" ? "bg-brand-purple" : "bg-white/5 border border-white/10 text-white/80"}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-white/30 text-[10px] animate-pulse ml-2">
              Thinking...
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/5">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Refine workflow..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-purple transition-all pr-10"
            />
            <button
              onClick={handleSendChat}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={handleRunWorkflow}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-brand-cyan transition-all shadow-xl"
            >
              {isRunning ? "Executing..." : "Run Workflow"}{" "}
              <Play size={14} fill="currentColor" />
            </button>
            <button
              onClick={handleSaveProject}
              className="p-2.5 rounded-xl bg-brand-surface border border-white/10 hover:border-white/20 transition-all"
            >
              <Save size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            {appType === "WEB" && artifacts.length > 0 && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl"
              >
                Live Preview <Eye size={14} />
              </button>
            )}
            <button
              onClick={() => downloadArtifactsAsZip(artifacts, goal)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple text-white font-black text-xs uppercase tracking-widest hover:bg-brand-purple/80 transition-all shadow-xl"
            >
              Download ZIP <Download size={14} />
            </button>
          </div>
        </div>

        <ReactFlow nodes={displayNodes} edges={edges} fitView>
          <Background color="#fff" opacity={0.03} gap={20} />
          <Controls className="!bg-brand-surface !border-white/5 !fill-white" />
        </ReactFlow>

        {/* Node Inspector Modal-like Panel */}
        {selectedNode && (
          <div className="absolute top-6 right-6 bottom-6 w-[400px] bg-brand-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl z-30 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-black text-lg tracking-tight">
                  {selectedNode.data.label}
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                  Node Inspector
                </p>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <section>
                <label className="text-[10px] font-black text-brand-purple uppercase tracking-widest block mb-2">
                  Instruction
                </label>
                <p className="text-sm text-white/70 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
                  {selectedNode.data.instruction}
                </p>
              </section>
              {selectedNode.data.input && (
                <section>
                  <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest block mb-2">
                    Input Context
                  </label>
                  <pre className="text-[10px] bg-black/40 p-4 rounded-2xl overflow-x-auto font-mono text-white/50 max-h-40">
                    {selectedNode.data.input}
                  </pre>
                </section>
              )}
              {selectedNode.data.output && (
                <section>
                  <label className="text-[10px] font-black text-green-500 uppercase tracking-widest block mb-2">
                    Generated Output
                  </label>
                  <pre className="text-[10px] bg-black/40 p-4 rounded-2xl overflow-x-auto font-mono text-white/80 max-h-80">
                    {selectedNode.data.output}
                  </pre>
                </section>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Web Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col">
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <Layout className="text-brand-cyan" />
              <h2 className="font-bold">Web Preview</h2>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-bold"
            >
              Close Preview
            </button>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              srcDoc={webPreviewContent || ""}
              className="w-full h-full border-none"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </div>
  );
}
