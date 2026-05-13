import { BrowserRouter, Routes, Route } from "react-router-dom";
import GoalChatPage from "./GoalChatPage";
import WorkflowPage from "./WorkflowPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GoalChatPage />} />
        <Route path="/workflow" element={<WorkflowPage />} />
      </Routes>
    </BrowserRouter>
  );
}
