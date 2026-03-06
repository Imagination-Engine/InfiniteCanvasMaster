import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Brain, Github, Shield, Cpu } from "lucide-react";
import logo from "../assets/logo.svg";

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-brand-bg-page text-brand-text-body font-sans selection:bg-brand-purple/30 selection:text-white relative scroll-smooth custom-scrollbar">
      {/* Global Moving Dot Grid Pattern */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '48px 48px',
            animation: 'moveGrid 60s linear infinite'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg-page via-transparent to-brand-bg-page" />
      </div>

      <style>{`
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }
      `}</style>

      {/* ─── Navigation ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-brand-bg-page/60 backdrop-blur-2xl border-b border-white/5 z-50 flex items-center justify-between px-8 md:px-20 transition-all">
        <div className="flex items-center gap-3 group cursor-default">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Balnce AI Logo" 
              width={40}
              height={40}
              className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(123,92,234,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(0,194,255,0.4)] transition-all duration-500" 
            />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                BALNCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-text-muted font-bold">Imagination Engine</span>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          <a href="#vision" className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-cyan transition-colors">Vision</a>
          <a href="#agents" className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-cyan transition-colors">Agents</a>
          <a href="#network" className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-cyan transition-colors">Network</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/projects" className="group relative px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(123,92,234,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(0,194,255,0.5)] active:scale-95 transition-all duration-300 flex items-center gap-2 overflow-hidden">
            <span className="relative z-10">Unleash Your Creativity</span>
            <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <main className="relative pt-40 pb-32 px-6 md:px-20">
        {/* Cinematic Background Elements */}
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-brand-purple/10 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-purple mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em]">Unlock Your Unlimited Digital Potential</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 uppercase">
            Your Life. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-[#9B79FF] to-brand-cyan">
              Your Voice.
            </span><br />
            Your World.
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-brand-text-body leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            The Imagination Engine by Balnce AI. A cinematic workspace where personal agents manifest your intent. Reclaim your attention. Broadcast your intention.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-24 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <Link to="/projects" className="px-10 py-5 bg-white text-brand-bg-page font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-[#F0F4FF] hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]">
              Build All Your Ideas
            </Link>
            <button className="px-10 py-5 bg-transparent border border-white/10 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-all duration-300">
              The Vision
            </button>
          </div>

          {/* ─── Premium Canvas Preview ─────────────────────────────────────── */}
          <div className="relative w-full max-w-6xl group animate-in zoom-in-95 fade-in duration-1000 delay-500">
             {/* Glow behind the card */}
             <div className="absolute inset-0 bg-brand-purple/20 rounded-[32px] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            
             <div className="relative aspect-[16/9] bg-brand-bg-surface/80 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden group-hover:border-brand-purple/30 transition-colors duration-700">
                {/* Simulated UI Glass Panels */}
                <div className="absolute top-8 left-8 bottom-8 w-64 bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-purple" />
                <div className="w-20 h-2 bg-white/10 rounded" />
                   </div>
                   <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 w-full bg-white/[0.05] rounded-xl flex items-center px-3 border border-white/5">
                           <div className="w-4 h-4 rounded bg-white/5" />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Central Animation Area */}
                <div className="ml-80 mt-8 mr-8 bottom-8 absolute inset-0 rounded-2xl bg-white/[0.01] border border-white/5 overflow-hidden flex items-center justify-center">
                   <div className="relative">
                      {/* Central Orb */}
                      <div className="w-48 h-48 bg-gradient-to-br from-brand-purple to-brand-cyan rounded-full blur-[60px] opacity-30 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                            <Brain size={40} className="text-white" />
                         </div>
                      </div>

                   </div>
                   
                   {/* Connection Lines Pattern */}
                   <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
                      <path d="M20,50 L80,50 M50,20 L50,80" stroke="white" strokeWidth="0.1" fill="none" />
                      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.1" fill="none" />
                   </svg>
                </div>

                {/* React Flow-esque Grid Pattern (Very subtle) */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
             </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-brand-bg-page border-t border-white/5 py-20 px-6 md:px-20 text-center flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="Balnce AI Logo" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="text-lg font-black tracking-tighter text-white uppercase leading-none">
            BALNCE <span className="text-brand-cyan">AI</span>
          </span>
        </div>
        
        <p className="text-brand-text-muted text-xs font-bold uppercase tracking-[0.3em] mb-12">
          Unlock Your Unlimited Digital Potential
        </p>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16">
           <button className="text-[11px] font-black uppercase tracking-widest text-brand-text-body hover:text-white transition-colors">Privacy First</button>
           <button className="text-[11px] font-black uppercase tracking-widest text-brand-text-body hover:text-white transition-colors">Digital Sovereignty</button>
           <button className="text-[11px] font-black uppercase tracking-widest text-brand-text-body hover:text-white transition-colors">A2A Protocol</button>
           <button className="text-[11px] font-black uppercase tracking-widest text-brand-text-body hover:text-white transition-colors">Open Source</button>
        </div>

        <div className="flex items-center gap-6 pt-12 border-t border-white/5 w-full max-w-lg justify-center">
           <a href="https://github.com" className="text-brand-text-muted hover:text-white transition-colors"><Github size={20} /></a>
           <span className="text-[10px] text-brand-text-muted font-medium tracking-wide">© 2026 BALNCE AI GROUP. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}