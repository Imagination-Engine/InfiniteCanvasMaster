import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../auth/AuthContext";
import {
  Sparkles,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/logo.svg";

interface AuthFormData {
  username: string;
  password: string;
}

export default function AuthPage() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState<
    "login" | "signup"
  >("login");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>();

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  const onFormSubmit = async (
    data: AuthFormData,
  ) => {
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(data.username, data.password);
      } else {
        await signup(
          data.username,
          data.password,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-brand-bg-page text-brand-text-body font-sans selection:bg-brand-purple/30 selection:text-white relative flex flex-col">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[150px] -z-10" />

      {/* ─── Navigation Header ────────────────────────────────────────── */}
      <nav className="h-20 bg-brand-bg-page/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 md:px-20 z-50">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="Balnce AI Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain drop-shadow-[0_0_10px_--theme(--color-brand-purple/30%)] hover:drop-shadow-[0_0_20px_--theme(--color-brand-cyan/40%)] transition-all duration-500"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                BALNCE{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-purple to-brand-cyan">
                  AI
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-text-muted font-bold">
                Imagination Engine
              </span>
            </div>
          </Link>
        </div>

        <Link
          to="/"
          className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors"
        >
          Back to the start
        </Link>
      </nav>

      {/* ─── Auth Form Container ──────────────────────────────────────── */}
      <main className="flex-1 grid place-items-center p-6 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-brand-purple/10 blur-[100px] -z-10" />

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="relative bg-brand-bg-surface/80 backdrop-blur-3xl rounded-[32px] border border-white/10 p-8 md:p-10 shadow-2xl space-y-8 group hover:border-brand-purple/30 transition-colors duration-500"
          >
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-purple mb-2">
                <Sparkles
                  size={12}
                  className="animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Neural Gateway
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                {mode === "login"
                  ? "Login to your canvas "
                  : "Register user"}
              </h1>
              <p className="text-sm text-brand-text-muted font-medium">
                {mode === "login"
                  ? "Enter your credentials to synchronize with the engine."
                  : "Create a new identity within the decentralised network."}
              </p>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="username"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-muted"
                  >
                    Identity Tag
                  </label>
                  {errors.username && (
                    <span className="text-[9px] text-red-400 uppercase font-bold tracking-tighter">
                      Required
                    </span>
                  )}
                </div>
                <div className="relative group/input">
                  <input
                    id="username"
                    {...register("username", {
                      required: true,
                    })}
                    placeholder="Enter username"
                    className="w-full rounded-2xl bg-white/3 border border-white/10 px-4 py-3.5 outline-none focus:border-brand-purple/50 focus:bg-white/5 transition-all text-white placeholder:text-brand-text-muted/50"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-brand-purple/20 to-brand-cyan/20 opacity-0 group-focus-within/input:opacity-100 blur transition-opacity -z-10" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-muted"
                  >
                    Secure Key
                  </label>
                  {errors.password && (
                    <span className="text-[9px] text-red-400 uppercase font-bold tracking-tighter">
                      {errors.password.type ===
                      "required"
                        ? "Required"
                        : "Min 8 characters"}
                    </span>
                  )}
                </div>
                <div className="relative group/input">
                  <input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: true,
                      minLength: 8,
                    })}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-white/3 border border-white/10 px-4 py-3.5 outline-none focus:border-brand-purple/50 focus:bg-white/5 transition-all text-white placeholder:text-brand-text-muted/50"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-brand-purple/20 to-brand-cyan/20 opacity-0 group-focus-within/input:opacity-100 blur transition-opacity -z-10" />
                </div>
              </div>
            </div>

            {error ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in zoom-in-95">
                {error}
              </div>
            ) : null}

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full px-6 py-4 bg-linear-to-r from-brand-purple to-brand-cyan text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_0_20px_3px_--theme(--color-brand-purple/40%)] hover:shadow-[0_0_30px_3px_--theme(--color-brand-cyan/50%)]  transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10">
                  {submitting
                    ? "Synchronising..."
                    : mode === "login"
                      ? "Initialize Session"
                      : "Deploy Identity"}
                </span>
                {!submitting && (
                  <ArrowRight
                    size={14}
                    className="relative z-10 group-hover:translate-x-1 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode(
                    mode === "login"
                      ? "signup"
                      : "login",
                  )
                }
                className="w-full text-[10px] font-bold uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors py-2"
              >
                {mode === "login"
                  ? "Lack authentication? Register Here"
                  : "Verified Operator? Login Here"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="py-8 px-6 text-center">
        <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-[0.3em]">
          Powered by the Imagination Engine • ©
          2026 BALNCE AI
        </p>
      </footer>
    </div>
  );
}
