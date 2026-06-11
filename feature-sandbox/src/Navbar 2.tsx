import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut, Cpu, Home } from "lucide-react";
import { useWorkflowStore } from "./store";
import { supabase } from "./supabase";

export default function Navbar() {
  const { session } = useWorkflowStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!session) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="h-16 border-b border-white/5 bg-brand-surface/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-brand-purple/20 text-brand-purple group-hover:bg-brand-purple transition-colors group-hover:text-white">
            <Cpu size={20} />
          </div>
          <h1 className="font-black tracking-tighter text-xl">
            IMAGINATION ENGINE
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${isActive("/") ? "text-white" : "text-white/40 hover:text-white"}`}
          >
            <Home size={16} /> Architect
          </Link>
          <Link
            to="/gallery"
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${isActive("/gallery") ? "text-white" : "text-white/40 hover:text-white"}`}
          >
            <LayoutGrid size={16} /> Gallery
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">
            Account
          </span>
          <span className="text-sm font-bold text-white/80">
            {session.user.email}
          </span>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all text-white/40"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
