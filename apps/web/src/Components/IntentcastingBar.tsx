import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface IntentcastingBarProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export default function IntentcastingBar({ onSubmit, isLoading }: IntentcastingBarProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim());
    setPrompt("");
  };

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-[100] pointer-events-none">
      <form 
        onSubmit={handleSubmit}
        className="pointer-events-auto relative group bg-[#111128]/80 backdrop-blur-2xl rounded-[32px] p-2 pr-2 flex items-center border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(123,92,234,0.3)] shadow-2xl"
      >
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-[#7B5CEA]/10 to-[#00C2FF]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="pl-5 pr-2 text-[#7B5CEA]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Unleash your intent"
          className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg py-3 px-2 font-medium"
          disabled={isLoading}
        />
        
        <button 
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="ml-2 bg-gradient-to-r from-[#7B5CEA] to-[#00C2FF] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.4)]"
        >
          {isLoading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Unleash <Send className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
