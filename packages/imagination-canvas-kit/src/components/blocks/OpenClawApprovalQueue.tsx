import React from "react";
import { useOpenClawApproval } from "../../hooks/useOpenClawApproval";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OpenClawApprovalQueue: React.FC<{ blockId: string }> = ({
  blockId,
}) => {
  const { queue, approve, deny, isProcessing } = useOpenClawApproval(blockId);

  if (queue.length === 0) {
    return (
      <div className="bg-red-500/5 rounded-xl p-8 border border-red-500/10 flex flex-col items-center justify-center text-center gap-2">
        <div className="p-3 bg-red-500/10 rounded-full text-red-500/50">
          <CheckCircle2 size={24} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
          No pending approvals
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {queue.map((req) => (
        <div
          key={req.requestId}
          className={cn(
            "flex flex-col gap-3 p-4 rounded-xl border transition-all",
            req.riskLevel === "critical"
              ? "bg-red-500/10 border-red-500/30"
              : req.riskLevel === "high"
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-white/5 border-white/10",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                  req.riskLevel === "critical"
                    ? "text-red-400"
                    : req.riskLevel === "high"
                      ? "text-amber-400"
                      : "text-brand-cyan",
                )}
              >
                <ShieldAlert size={12} />
                {req.actionType.replace("_", " ")}
              </span>
              <span className="text-[14px] font-bold text-white mt-1">
                {req.title}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-black/40 rounded border border-white/10 text-[8px] font-black text-white/50 uppercase">
              {req.requestedBy}
            </span>
          </div>

          <p className="text-[11px] text-white/70 leading-relaxed font-mono bg-black/40 p-2 rounded">
            {req.summary}
          </p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => deny(req.requestId)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50"
            >
              <XCircle size={14} /> Deny
            </button>
            <button
              onClick={() => approve(req.requestId)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
