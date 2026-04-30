import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import {
  MessageSquare,
  LayoutGrid,
  History,
  Settings,
  LogOut,
  Plus,
  Compass,
} from "lucide-react";
import logo from "../../../assets/logo.svg";

export const GlobalSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "chat", label: "Studio", icon: MessageSquare, path: "/projects" },
    {
      id: "creations",
      label: "My Creations",
      icon: LayoutGrid,
      path: "/creations",
    },
    { id: "history", label: "History", icon: History, path: "/history" },
    { id: "explore", label: "Explore", icon: Compass, path: "/explore" },
  ];

  return (
    <aside className="w-64 h-full bg-brand-bg-surface border-r border-white/5 flex flex-col z-[100] transition-all duration-300">
      <div className="p-6 mb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 drop-shadow-[0_0_8px_rgba(123,92,234,0.3)] transition-transform group-hover:scale-110"
          />
          <span className="text-lg font-black uppercase tracking-tighter text-white">
            BALNCE
          </span>
        </Link>
      </div>

      <div className="px-4 mb-8">
        <button
          onClick={() => navigate("/projects")}
          className="w-full py-3 px-4 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 rounded-xl text-brand-purple text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-purple/10"
        >
          <Plus size={14} strokeWidth={3} />
          New Flow
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? "bg-white/10 text-white shadow-inner" : "text-brand-text-muted hover:bg-white/5 hover:text-white"}`}
            >
              <item.icon
                size={18}
                className={`${isActive ? "text-brand-cyan" : "text-current"} transition-colors`}
              />
              <span className="text-sm font-bold tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-text-muted hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings size={18} />
          <span className="text-sm font-bold tracking-tight">Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-brand-text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
        >
          <LogOut
            size={18}
            className="group-hover:rotate-12 transition-transform"
          />
          <span className="text-sm font-bold tracking-tight">Disconnect</span>
        </button>
      </div>
    </aside>
  );
};
