import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "./components/Canvas";
import { Sidebar } from "./components/Sidebar";

/**
 * App — root component for the Imagination Canvas.
 *
 * Layout:
 *  ┌──────────┬──────────────────────────────────────┐
 *  │ Sidebar  │          Canvas (React Flow)          │
 *  │ (modules)│  nodes · edges · pan · zoom · minimap │
 *  └──────────┴──────────────────────────────────────┘
 *
 * ReactFlowProvider MUST wrap any component that calls useReactFlow().
 */
function App() {
  return (
    <ReactFlowProvider>
      <div className="flex w-screen h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <Canvas />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
