import { ReactFlow, Background, Controls, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Link, Navigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import AgentStepNode from "../nodes/AgentStepNode";
import { X, Pause, Check, Sparkles, Download, ExternalLink, FileCode, FileText, Image as ImageIcon, Terminal } from "lucide-react";

const nodeTypes = {
  agentStep: AgentStepNode,
  agentRun: AgentStepNode
};

export default function ProjectCanvasPage() {
  const { projectId } = useParams(); // This is the task_id
  const { accessToken } = useAuth();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [prompt, setPrompt] = useState('');
  const [submittingPrompt, setSubmittingPrompt] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [projectLoadError, setProjectLoadError] = useState(false);

  const loadProjectInfo = useCallback(async () => {
    if (!accessToken || !projectId) return;
    try {
      const data = await apiRequest<any>(`/api/projects/${projectId}`, {}, accessToken);
      if (data && data.project) {
        setProjectInfo(data.project);
        setProjectLoadError(false);
      } else {
        setProjectLoadError(true);
      }
    } catch (err) {
      console.error("Failed to load project info", err);
      setProjectLoadError(true);
    }
  }, [accessToken, projectId]);

  const loadData = useCallback(async () => {
    if (!accessToken || !projectId) return;

    try {
      const runs = await apiRequest<any[]>("/runs", {}, accessToken);
      const projectRuns = runs.filter(r => r.task_id === projectId);
      
      setNodes((currentNodes) => {
        const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        projectRuns.forEach((run, rIdx) => {
          const runId = `run-${run.id}`;
          const existingRun = nodeMap.get(runId);
          
          const runY = existingRun ? existingRun.position.y : (rIdx * 1000);
          
          newNodes.push({
            id: runId,
            type: 'agentRun',
            position: { x: 250, y: runY },
            data: { ...run, type: 'run', name: `Run ${run.id.slice(0,4)}` }
          });

          run.steps.forEach((step: any, sIdx: number) => {
            const stepId = `step-${step.id}`;
            const existingStep = nodeMap.get(stepId);
            
            newNodes.push({
              id: stepId,
              type: 'agentStep',
              position: { 
                x: existingStep ? existingStep.position.x : 250, 
                y: existingStep ? existingStep.position.y : runY + ((sIdx + 1) * 200) 
              },
              data: { ...step, type: 'step' }
            });
            
            const prevId = sIdx === 0 ? runId : `step-${run.steps[sIdx-1].id}`;
            newEdges.push({ 
              id: `e-${prevId}-${stepId}`, 
              source: prevId, 
              target: stepId,
              animated: step.status === 'running',
              style: { stroke: '#475569', strokeWidth: 2 }
            });
          });
        });

        setEdges(newEdges);
        return newNodes;
      });
      
    } catch (err) {
      console.error("Failed to load runs", err);
    }
  }, [accessToken, projectId, setNodes, setEdges]);

  useEffect(() => {
    void loadProjectInfo();
    void loadData();
    const interval = setInterval(() => {
      void loadData();
      void loadProjectInfo();
    }, 2000);
    return () => clearInterval(interval);
  }, [loadData, loadProjectInfo]);

  // Update selected element data if it changes in the background
  useEffect(() => {
    if (selectedElement) {
      const updatedNode = nodes.find(n => n.id === (selectedElement.type === 'step' ? `step-${selectedElement.id}` : `run-${selectedElement.id}`));
      if (updatedNode && JSON.stringify(updatedNode.data) !== JSON.stringify(selectedElement)) {
        setSelectedElement(updatedNode.data);
      }
    }
  }, [nodes, selectedElement]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedElement(node.data);
  };

  const approveRun = async (runId: string) => {
    try {
      await apiRequest(`/api/runs/${runId}/resume`, {
        method: "POST",
        body: JSON.stringify({ feedback })
      }, accessToken);
      setFeedback('');
      loadData();
    } catch (err) {
      console.error('Error approving run:', err);
    }
  };

  const rejectRun = async (runId: string) => {
    try {
      await apiRequest(`/api/runs/${runId}/reject`, { method: "POST" }, accessToken);
      setFeedback('');
      loadData();
    } catch (err) {
      console.error('Error rejecting run:', err);
    }
  };

  const startNewRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !accessToken || !projectId) return;

    setSubmittingPrompt(true);
    try {
      await apiRequest(`/api/projects/${projectId}/run`, {
        method: 'POST',
        body: JSON.stringify({ prompt })
      }, accessToken);
      setPrompt('');
      loadData();
      loadProjectInfo();
    } catch (err) {
      console.error('Failed to start run', err);
    } finally {
      setSubmittingPrompt(false);
    }
  };

  const downloadFile = (filename: string) => {
    const url = `/workspace_files/${filename}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInBrowser = (filename: string) => {
    window.open(`/workspace_files/${filename}`, '_blank');
  };

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  const renderOutput = (output: string) => {
    if (!output) return null;

    const isImage = output.toLowerCase().includes('.png') || output.toLowerCase().includes('.jpg') || output.toLowerCase().includes('.jpeg') || output.toLowerCase().includes('.gif') || output.toLowerCase().includes('.svg');
    const isCode = output.toLowerCase().includes('.ts') || output.toLowerCase().includes('.js') || output.toLowerCase().includes('.py') || output.toLowerCase().includes('.html') || output.toLowerCase().includes('.css') || output.toLowerCase().includes('.json');
    const isDoc = output.toLowerCase().includes('.md') || output.toLowerCase().includes('.txt') || output.toLowerCase().includes('.pdf');

    // Make the regex more robust to catch different ways files might be referenced in the output
    const filenameMatch = output.match(/(?:saved to |created file:? |file written:? )?([a-zA-Z0-9_.-]+\.(?:png|jpg|jpeg|gif|svg|ts|js|py|html|css|json|md|txt|pdf))/i) || 
                          output.match(/([a-zA-Z0-9_.-]+\.(?:png|jpg|jpeg|gif|svg|ts|js|py|html|css|json|md|txt|pdf))/i);
    const filename = filenameMatch ? filenameMatch[1] : null;

    return (
      <div className="space-y-4">
        <div className="text-sm bg-slate-950 text-slate-300 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap font-mono relative group max-h-96 overflow-y-auto">
          {output}
        </div>
        
        {filename && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-4 mt-4 shadow-lg border-t-2 border-t-brand-purple/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {isImage ? <ImageIcon size={16} className="text-purple-400" /> : 
                 isCode ? <FileCode size={16} className="text-emerald-400" /> : 
                 isDoc ? <FileText size={16} className="text-blue-400" /> : 
                 <Terminal size={16} className="text-slate-400" />}
                <span className="text-sm font-bold text-slate-200 truncate">{filename}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openInBrowser(filename)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-600/50"
                  title="Open in Browser"
                >
                  <ExternalLink size={16} />
                </button>
                <button 
                  onClick={() => downloadFile(filename)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-600/50"
                  title="Download"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {isImage && (
              <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 group relative mt-2">
                <img 
                  src={`/workspace_files/${filename}`} 
                  alt="Generated content"
                  className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openInBrowser(filename)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-200">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 px-4 bg-slate-900 z-10">
        <Link to="/projects" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Projects</Link>
        <div className="flex items-center gap-4">
          <div className="h-4 w-[1px] bg-slate-800" />
          <h1 className="text-sm font-bold text-slate-200">
            {projectInfo?.name ? projectInfo.name : projectLoadError ? 'Project Not Found' : 'Loading Project...'}
          </h1>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500">Agent Canvas</p>
      </div>
      
      <div className="flex min-h-0 flex-1 relative">
        <div className="flex-1 relative">
          {/* Active Task Query Header */}
          {projectInfo?.description && projectInfo.description !== 'Waiting for initial prompt...' && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4 pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md border border-brand-purple/20 rounded-2xl px-6 py-3 shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-brand-purple">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-0.5">Active Task</div>
                    <div className="text-sm text-slate-200 font-medium truncate">{projectInfo.description}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-950"
          >
            <Background color="#334155" gap={20} />
            <Controls className="!bg-slate-800 !border-slate-700 !fill-slate-200" />
          </ReactFlow>

          {/* Floating Prompt Input Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-none">
            <form onSubmit={startNewRun} className="relative flex items-center pointer-events-auto">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={submittingPrompt}
                placeholder="Give the agent a task (e.g. 'Research quantum computing and write a summary')" 
                className="w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full pl-6 pr-16 py-4 text-sm text-white placeholder:text-slate-500 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!prompt.trim() || submittingPrompt}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-brand-purple to-brand-cyan rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Sparkles size={16} />
              </button>
            </form>
          </div>
        </div>

        {selectedElement && (
          <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto shadow-2xl z-20 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="min-w-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedElement.type}</label>
                <h2 className="text-xl font-bold text-white truncate">{selectedElement.name}</h2>
              </div>
              <button onClick={() => setSelectedElement(null)} className="text-slate-500 hover:text-slate-300 ml-4">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                <div className={`mt-1 font-medium ${
                  selectedElement.status === 'completed' ? 'text-green-500' : 
                  selectedElement.status === 'failed' ? 'text-red-500' : 
                  selectedElement.status === 'waiting_for_human' ? 'text-amber-500' : 'text-blue-500'
                }`}>
                  {selectedElement.status}
                </div>
              </div>

              {selectedElement.type === 'step' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tool</label>
                    <div className="mt-1 font-mono text-sm bg-slate-950 text-slate-300 p-3 rounded-lg border border-slate-800">{selectedElement.tool_name || 'none'}</div>
                  </div>
                  {selectedElement.tool_args && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Arguments</label>
                      <pre className="mt-1 text-xs bg-slate-950 text-green-400 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                        {JSON.stringify(selectedElement.tool_args, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedElement.output && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Output</label>
                      <div className="mt-1">
                        {renderOutput(selectedElement.output)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedElement.status === 'waiting_for_human' && (
              <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-500 font-bold mb-2">
                  <Pause size={18} /> Human Approval Required
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Feedback / Changes (Optional)</label>
                  <textarea 
                    className="w-full p-3 border border-slate-700 rounded-lg text-sm bg-slate-950 text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                    placeholder="e.g. 'Add one more step to save as PDF' or 'The art looks too simple'..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => approveRun(selectedElement.run_id || selectedElement.id)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Check size={20} /> {feedback ? 'Submit Feedback' : 'Approve & Continue'}
                  </button>
                  <button 
                    onClick={() => rejectRun(selectedElement.run_id || selectedElement.id)}
                    className="w-full bg-slate-900 text-red-500 py-3 rounded-lg font-bold border border-red-900/50 flex items-center justify-center gap-2 hover:bg-red-950/30 transition-colors"
                  >
                    <X size={20} /> Reject & Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
