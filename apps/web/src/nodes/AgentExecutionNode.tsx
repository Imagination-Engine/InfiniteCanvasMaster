import { Brain, Loader2 } from "lucide-react";

export default function AgentExecutionNode({ data }: { data: { prompt: string } }) {
  return (
    <div className="relative min-w-[300px] max-w-[400px] bg-brand-bg-surface/80 backdrop-blur-3xl rounded-2xl border border-[#7B5CEA]/40 shadow-[0_0_40px_-10px_rgba(123,92,234,0.4)] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7B5CEA] to-[#00C2FF] animate-[pulse_1.5s_ease-in-out_infinite]" />
      <div className="absolute -inset-2 bg-gradient-to-r from-[#7B5CEA]/10 to-[#00C2FF]/10 blur-xl z-[-1] animate-[pulse_3s_ease-in-out_infinite]" />
      
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#7B5CEA]/20 rounded-xl text-[#7B5CEA] border border-[#7B5CEA]/20">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
              Agent Orchestrator
              <Loader2 className="w-3.5 h-3.5 text-[#00C2FF] animate-spin" />
            </h3>
            <p className="text-[10px] text-[#00C2FF] uppercase tracking-widest mt-0.5 font-semibold">
              Designing Spatial Workflow...
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 relative text-left">
          <p className="text-xs font-medium text-white/90 leading-relaxed italic">
            <span className="text-[#00C2FF] mr-2 not-italic">❯</span>
            "{data.prompt}"
          </p>
        </div>
      </div>
    </div>
  );
}
