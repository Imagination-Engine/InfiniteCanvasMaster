import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import AuthPage from "./Pages/AuthPage";
import ProjectsPage from "./Pages/ProjectsPage";
import ProjectCanvasPage from "./Pages/ProjectCanvasPage";
import { FilesystemPage } from "./Components/filesystem/FilesystemPage";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen grid place-items-center bg-slate-950 text-slate-200">Loading...</div>;
  }

  return <Navigate to={user ? "/projects" : "/auth"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/filesystem" element={<FilesystemPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId/canvas" element={<ProjectCanvasPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
