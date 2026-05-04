import React from "react";
import { CanvasObject } from "../../contracts";
import { MessageSquare, Send } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";

export const ChatBlock: React.FC<{ object: CanvasObject }> = ({ object }) => {
  const zoom = useViewportStore((s) => s.viewport.zoom);
  const messages = (object.metadata?.messages as any[]) || [];

  const isFarOut = zoom < 0.3;

  return (
    <div
      className="p-4 bg-black/40 border border-brand-cyan/20 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl"
      style={{ width: object.width, height: object.height }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-brand-cyan/20 rounded-lg text-brand-cyan">
          <MessageSquare size={16} />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest">
          Chat Shell
        </div>
      </div>

      {!isFarOut ? (
        <div className="flex-1 flex flex-col gap-3 overflow-auto custom-scrollbar pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                "flex flex-col gap-1 " +
                (msg.role === "user" ? "items-end" : "items-start")
              }
            >
              <div className="text-[8px] text-brand-text-muted uppercase font-black tracking-tighter">
                {msg.role}
              </div>
              <div
                className={
                  "text-[10px] p-2 rounded-xl max-w-[90%] " +
                  (msg.role === "user"
                    ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                    : "bg-white/5 text-white border border-white/10")
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[10px] text-brand-text-muted italic">
              No messages yet.
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="w-2/3 h-2 bg-white/5 rounded-full" />
          <div className="w-1/2 h-2 bg-brand-cyan/10 rounded-full self-end" />
          <div className="w-3/4 h-2 bg-white/5 rounded-full" />
        </div>
      )}

      <div className="mt-auto pt-2 border-t border-white/5 flex gap-2">
        <div className="flex-1 h-8 bg-white/5 border border-white/10 rounded-lg px-2 flex items-center text-[10px] text-brand-text-muted">
          Type message...
        </div>
        <div className="w-8 h-8 bg-brand-cyan/10 rounded-lg flex items-center justify-center text-brand-cyan">
          <Send size={12} />
        </div>
      </div>
    </div>
  );
};
