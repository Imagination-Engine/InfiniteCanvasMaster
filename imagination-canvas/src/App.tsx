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
 * We place it here so both Canvas and future siblings can access the
 * shared flow instance.
 */
function App() {
  return (
    <ReactFlowProvider>
      <div className="app-shell">
        <Sidebar />
        <Canvas />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
