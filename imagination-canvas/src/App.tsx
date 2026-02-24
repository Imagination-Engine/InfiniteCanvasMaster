import { ReactFlowProvider } from "@xyflow/react";
import { useMemo, useState } from "react";
import Canvas from "./Components/Canvas";
import { Sidebar } from "./Components/Sidebar";
import type {
  LocalSession,
  SourceMode,
} from "./types/spendtrace";

const SESSION_STORAGE_KEY = "spendtrace.local.session";

const readStoredSession = (): LocalSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as LocalSession;
    if (!parsed.name || !parsed.email || !parsed.sourceMode) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const storeSession = (session: LocalSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

function LocalLogin({
  onLogin,
}: {
  onLogin: (session: LocalSession) => void;
}) {
  const [name, setName] = useState("Joshua");
  const [email, setEmail] = useState("josh@example.com");
  const [sourceMode, setSourceMode] = useState<SourceMode>("DEMO");

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">SpendTrace Canvas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Localhost mode. Sign in to unlock the imagination canvas.
        </p>

        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Name"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Email"
            type="email"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSourceMode("DEMO")}
              className={`rounded-md px-2 py-2 text-sm font-semibold ${
                sourceMode === "DEMO"
                  ? "bg-slate-800 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setSourceMode("PLAID")}
              className={`rounded-md px-2 py-2 text-sm font-semibold ${
                sourceMode === "PLAID"
                  ? "bg-slate-800 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              Plaid (stub)
            </button>
          </div>
        </div>

        <button
          onClick={() =>
            onLogin({
              name: name.trim() || "Local User",
              email: email.trim() || "local@example.com",
              sourceMode,
              loggedInAt: new Date().toISOString(),
            })
          }
          className="mt-4 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
        >
          Enter Canvas
        </button>
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<LocalSession | null>(
    () => readStoredSession(),
  );

  const activeSession = useMemo(() => session, [session]);

  if (!activeSession) {
    return (
      <LocalLogin
        onLogin={(nextSession) => {
          storeSession(nextSession);
          setSession(nextSession);
        }}
      />
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen bg-slate-100 text-slate-900">
        <Sidebar
          userName={activeSession.name}
          sourceMode={activeSession.sourceMode}
          onSourceModeChange={(sourceMode) => {
            const nextSession = {
              ...activeSession,
              sourceMode,
            };
            storeSession(nextSession);
            setSession(nextSession);
          }}
          onLogout={() => {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setSession(null);
          }}
        />
        <Canvas sourceMode={activeSession.sourceMode} />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
