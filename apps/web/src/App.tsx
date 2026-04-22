import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import AuthPage from "./Pages/AuthPage";
import ProjectsPage from "./Pages/ProjectsPage";
import SessionPage from "./Pages/SessionPage";
import { FilesystemPage } from "./Components/filesystem/FilesystemPage";
import LandingPage from "./Pages/LandingPage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/auth"
            element={<AuthPage />}
          />
         
          <Route
            path="/filesystem"
            element={<FilesystemPage />}
          />

          <Route element={<RequireAuth />}>
            <Route
              path="/projects"
              element={<ProjectsPage />}
            />
            <Route
              path="/projects/:projectId"
              element={<SessionPage />}
            />
            <Route
              path="/projects/:projectId/canvas"
              element={<SessionPage />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
