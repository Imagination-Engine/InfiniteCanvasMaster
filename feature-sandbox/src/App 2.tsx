import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GoalChatPage from "./GoalChatPage";
import WorkflowPage from "./WorkflowPage";
import AuthPage from "./AuthPage";
import GalleryPage from "./GalleryPage";
import Navbar from "./Navbar";
import { supabase } from "./supabase";
import { useWorkflowStore } from "./store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useWorkflowStore();
  if (!session) return <Navigate to="/auth" />;
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export default function App() {
  const { setSession } = useWorkflowStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GoalChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflow"
          element={
            <ProtectedRoute>
              <WorkflowPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
