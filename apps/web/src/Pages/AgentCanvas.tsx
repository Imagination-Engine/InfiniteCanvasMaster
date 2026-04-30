import Canvas from "../Components/Canvas";
import { Sidebar } from "../Components/Sidebar";

/**
 * AgentCanvas — A specialized canvas view for agentic workflows.
 * Currently a shell based on ImaginationCanvas.
 */
export default function AgentCanvas() {
  return (
    <div className="flex w-full h-full text-slate-900 shrink-0 flex-1">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 italic text-slate-400">
        <p>Agent Workflow Canvas (Coming Soon)</p>
        <div className="w-full h-full opacity-50 pointer-events-none">
           <Canvas />
        </div>
      </div>
    </div>
  );
}
