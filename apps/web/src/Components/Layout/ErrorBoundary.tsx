import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen grid place-items-center bg-brand-bg-page text-brand-text-body font-sans relative overflow-hidden">
           <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none" />
           <div className="z-10 flex flex-col items-center text-center max-w-md px-6">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.15)]">
                 <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
                System Malfunction
              </h1>
              <p className="text-brand-text-muted mb-8 text-sm">
                The Imagination Engine encountered an unexpected exception in the UI thread. This has been caught to prevent full substrate failure.
              </p>
              
              <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-left mb-8 overflow-x-auto">
                <p className="text-rose-400 font-mono text-xs">
                  {this.state.error?.message || "Unknown Error"}
                </p>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-brand-cyan hover:text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <RefreshCw size={16} />
                Reboot Engine
              </button>
           </div>
        </div>
      );
    }

    return this.props.children;
  }
}
