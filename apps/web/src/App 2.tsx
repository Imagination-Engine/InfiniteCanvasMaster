import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import AuthPage from "./Pages/AuthPage";
import StudioPage from "./Pages/StudioPage";
import CreationsPage from "./Pages/CreationsPage";
import SessionPage from "./Pages/SessionPage";
import { FilesystemPage } from "./Components/filesystem/FilesystemPage";
import LandingPage from "./Pages/LandingPage";
import { ErrorBoundary } from "./Components/Layout/ErrorBoundary";
import DiagnosticPage from "./Pages/DiagnosticPage";
import { GlobalLayout } from "./Components/Layout/GlobalLayout/GlobalLayout";

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
              {/* Studio and Creations have the Global Sidebar */}
              <Route element={<GlobalLayout />}>
                <Route path="/projects" element={<StudioPage />} />
                <Route path="/creations" element={<CreationsPage />} />
              </Route>

              {/* Canvas Sessions are FULL SCREEN (No Sidebar) */}
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
