import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import AuthPage from "./Pages/AuthPage";
import HomeStudio from "./Pages/HomeStudio";
import SessionPage from "./Pages/SessionPage";
import { FilesystemPage } from "./Components/filesystem/FilesystemPage";
import LandingPage from "./Pages/LandingPage";
import { ErrorBoundary } from "./Components/Layout/ErrorBoundary";
import DiagnosticPage from "./Pages/DiagnosticPage";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/filesystem" element={<FilesystemPage />} />

            <Route path="/diagnostic" element={<DiagnosticPage />} />

            <Route element={<RequireAuth />}>
              <Route path="/projects" element={<HomeStudio />} />
              <Route path="/projects/:projectId" element={<SessionPage />} />
              <Route
                path="/projects/:projectId/canvas"
                element={<SessionPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
