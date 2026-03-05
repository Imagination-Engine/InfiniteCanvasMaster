import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await signup(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">{mode === "login" ? "Log In" : "Sign Up"}</h1>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm text-slate-300">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-slate-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
            required
            minLength={8}
          />
        </div>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 px-4 py-2 font-medium"
        >
          {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-sm text-slate-300 hover:text-slate-100"
        >
          {mode === "login"
            ? "No account yet? Switch to sign up"
            : "Have an account? Switch to login"}
        </button>
      </form>
    </div>
  );
}
