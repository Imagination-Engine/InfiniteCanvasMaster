// @ts-nocheck
import React from "react";

export interface BottomCommandZoneProps {
  hint?: string;
  showAiInput?: boolean;
  onAiSubmit?: (value: string) => void;
  className?: string;
}

export const BottomCommandZone: React.FC<BottomCommandZoneProps> = ({
  hint,
  showAiInput = false,
  onAiSubmit,
  className,
}) => {
  return (
    <div
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full max-w-xl px-4 ${className}`}
    >
      {hint && (
        <div className="px-3 py-1 rounded-md bg-white/5 backdrop-blur-sm border border-white/5 text-[11px] text-white/50 font-mono tracking-tight animate-in fade-in slide-in-from-bottom-2">
          {hint}
        </div>
      )}

      {showAiInput && (
        <div className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-brand-bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <input
              type="text"
              placeholder="Ask AI about selection..."
              className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-sm text-white placeholder:text-white/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && onAiSubmit) {
                  onAiSubmit(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="pr-4 flex gap-2">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/40">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
