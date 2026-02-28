import { ReactFlowProvider } from "@xyflow/react";

import ImaginationCanvas from "./Pages/ImaginationCanvas";
import AgentCanvas from "./Pages/AgentCanvas";
import LandingPage from "./Pages/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/ImaginationCanvas" 
          element={
            <ReactFlowProvider>
              <div className="flex w-screen h-screen bg-slate-50 text-slate-900">
                <ImaginationCanvas />
              </div>
            </ReactFlowProvider>
          } 
        />
        <Route 
          path="/AgentCanvas" 
          element={
            <ReactFlowProvider>
              <div className="flex w-screen h-screen bg-slate-50 text-slate-900">
                <AgentCanvas />
              </div>
            </ReactFlowProvider>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
