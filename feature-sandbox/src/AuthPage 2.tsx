import { useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Zap } from "lucide-react";
import { useWorkflowStore } from "./store";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { setSession } = useWorkflowStore();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If user enters a simple username, we turn it into a dummy email
    const loginIdentifier = email.includes("@")
      ? email
      : `${email}@imagination.engine`;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: loginIdentifier,
          password,
          options: {
            data: { username: email },
          },
        });
        if (error) throw error;
        alert(
          "Account created! If you disabled 'Email Confirmation' in Supabase, you can log in now.",
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginIdentifier,
          password,
        });
        if (error) throw error;
        setSession(data.session);
        navigate("/");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    // Create a mock session for development
    const mockSession: any = {
      user: { id: "dev-user-id", email: "dev@local.test" },
      access_token: "mock-token",
    };
    setSession(mockSession);
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-bg text-white p-6">
      <div className="w-full max-w-md bg-brand-surface p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black tracking-tighter">
            IMAGINATION ENGINE
          </h1>
        </div>
        <p className="text-white/50 mb-8 text-sm uppercase tracking-widest">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">
              Username or Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. developer"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-4 bg-brand-purple rounded-xl font-bold uppercase tracking-widest hover:bg-brand-purple/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-xs text-white/30 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
          </button>

          <button
            onClick={handleDevBypass}
            className="w-full py-3 border border-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-all flex items-center justify-center gap-2"
          >
            <Zap size={14} /> Developer Bypass (Offline Mode)
          </button>

          <div className="bg-brand-purple/10 p-4 rounded-xl border border-brand-purple/20 flex gap-3">
            <ShieldAlert size={16} className="text-brand-purple shrink-0" />
            <p className="text-[10px] text-white/50 leading-relaxed">
              <span className="font-bold text-white">Dev Tip:</span> To avoid
              email limits, go to{" "}
              <span className="text-brand-purple">
                Supabase Dashboard {">"} Auth {">"} Providers {">"} Email
              </span>{" "}
              and disable "Confirm Email".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
