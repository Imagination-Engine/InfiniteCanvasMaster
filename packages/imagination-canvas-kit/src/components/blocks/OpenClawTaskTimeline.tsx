// @ts-nocheck
import React from "react";
import { OpenClawBlockEvent } from "../../contracts/openclaw";
import { Activity } from "lucide-react";

export const OpenClawTaskTimeline: React.FC<{
  events: OpenClawBlockEvent[];
}> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 border-dashed">
        <Activity size={16} className="text-white/20 mb-2" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
          No events recorded
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((evt, idx) => {
        const isError =
          evt.type.includes("error") || evt.type.includes("failed");
        const isSuccess =
          evt.type.includes("completed") || evt.type.includes("approved");
        const isWarning = evt.type.includes("approval.required");

        let colorClass = "text-brand-cyan";
        if (isError) colorClass = "text-red-400";
        if (isSuccess) colorClass = "text-green-400";
        if (isWarning) colorClass = "text-amber-400";

        return (
          <div
            key={idx}
            className="flex flex-col gap-1 p-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-white/40 font-mono tracking-tighter">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${colorClass}`}
                >
                  {evt.type.replace("openclaw.", "")}
                </span>
              </div>
            </div>

            {/* Safe rendering of remaining redacted payload, excluding common top-level keys */}
            <pre className="text-[8px] text-white/50 font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(evt).filter(
                    ([k]) => !["type", "timestamp", "blockId"].includes(k),
                  ),
                ),
                null,
                2,
              )}
            </pre>
          </div>
        );
      })}
    </div>
  );
};
