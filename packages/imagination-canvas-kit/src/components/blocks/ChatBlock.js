import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageSquare, Send } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";
export const ChatBlock = ({ object }) => {
  const zoom = useViewportStore((s) => s.zoom);
  const messages = object.metadata?.messages || [];
  const isFarOut = zoom < 0.3;
  return _jsxs("div", {
    className:
      "p-4 bg-black/40 border border-brand-cyan/20 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl",
    style: { width: object.width, height: object.height },
    children: [
      _jsxs("div", {
        className: "flex items-center gap-2 mb-1",
        children: [
          _jsx("div", {
            className: "p-1.5 bg-brand-cyan/20 rounded-lg text-brand-cyan",
            children: _jsx(MessageSquare, { size: 16 }),
          }),
          _jsx("div", {
            className: "text-xs font-bold uppercase tracking-widest",
            children: "Chat Shell",
          }),
        ],
      }),
      !isFarOut
        ? _jsxs("div", {
            className:
              "flex-1 flex flex-col gap-3 overflow-auto custom-scrollbar pr-1",
            children: [
              messages.map((msg, idx) =>
                _jsxs(
                  "div",
                  {
                    className:
                      "flex flex-col gap-1 " +
                      (msg.role === "user" ? "items-end" : "items-start"),
                    children: [
                      _jsx("div", {
                        className:
                          "text-[8px] text-brand-text-muted uppercase font-black tracking-tighter",
                        children: msg.role,
                      }),
                      _jsx("div", {
                        className:
                          "text-[10px] p-2 rounded-xl max-w-[90%] " +
                          (msg.role === "user"
                            ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                            : "bg-white/5 text-white border border-white/10"),
                        children: msg.content,
                      }),
                    ],
                  },
                  idx,
                ),
              ),
              messages.length === 0 &&
                _jsx("div", {
                  className:
                    "flex-1 flex items-center justify-center text-[10px] text-brand-text-muted italic",
                  children: "No messages yet.",
                }),
            ],
          })
        : _jsxs("div", {
            className: "flex-1 flex flex-col gap-2 justify-center",
            children: [
              _jsx("div", { className: "w-2/3 h-2 bg-white/5 rounded-full" }),
              _jsx("div", {
                className: "w-1/2 h-2 bg-brand-cyan/10 rounded-full self-end",
              }),
              _jsx("div", { className: "w-3/4 h-2 bg-white/5 rounded-full" }),
            ],
          }),
      _jsxs("div", {
        className: "mt-auto pt-2 border-t border-white/5 flex gap-2",
        children: [
          _jsx("div", {
            className:
              "flex-1 h-8 bg-white/5 border border-white/10 rounded-lg px-2 flex items-center text-[10px] text-brand-text-muted",
            children: "Type message...",
          }),
          _jsx("div", {
            className:
              "w-8 h-8 bg-brand-cyan/10 rounded-lg flex items-center justify-center text-brand-cyan",
            children: _jsx(Send, { size: 12 }),
          }),
        ],
      }),
    ],
  });
};
