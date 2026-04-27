import React from "react";
import { PenLine, Sparkles } from "lucide-react";
import type { BlockViewProps } from "@iem/core";

export const ProseView: React.FC<
  BlockViewProps<{ payload?: string }, { text: string }>
> = ({ id, data = {} as any, onParamsChange, onRun }) => {
  const {
    status,
    input = {} as any,
    output = {} as any,
    error,
    params = {} as any,
  } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* Editor Area */}
      <div className="relative group">
        <textarea
          value={(params?.payload as string) || input?.payload || ""}
          onChange={(e) => onParamsChange({ payload: e.target.value })}
          placeholder="Write your seed or prompt here..."
          className="w-full min-h-[120px] rounded-xl bg-white/[0.03] border border-white/10 p-4 text-[13px] font-medium leading-relaxed text-white outline-none focus:border-brand-purple/50 transition-all placeholder:text-brand-text-muted/30 resize-none custom-scrollbar"
        />
        <div className="absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity">
          <PenLine size={14} className="text-brand-purple" />
        </div>
      </div>

      {/* Action / Status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {status === "running" && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-purple animate-pulse">
              <Sparkles size={12} />
              Generating...
            </div>
          )}
          {status === "error" && (
            <div className="text-[10px] font-black uppercase tracking-widest text-red-400">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Output Display */}
      {output?.text && (
        <div className="rounded-2xl border border-white/5 bg-brand-bg-page/50 p-4 shadow-inner">
          <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-brand-purple/70">
            Manuscript Output
          </div>
          <div className="text-[14px] font-serif leading-loose text-brand-text-body whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar italic selection:bg-brand-purple/30">
            {output.text}
          </div>
        </div>
      )}
    </div>
  );
};
