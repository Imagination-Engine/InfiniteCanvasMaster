import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Target, CheckCircle2, Clock } from "lucide-react";
export const GoalBlock = ({ object }) => {
  const progress = object.metadata?.progress || 0;
  const title = object.metadata?.title || "Untitled Goal";
  const isComplete = object.status === "complete";
  const isRunning = object.status === "running";
  return _jsxs("div", {
    className:
      "p-4 bg-black/60 border border-brand-cyan/40 shadow-[0_0_30px_rgba(0,194,255,0.1)] hover:border-brand-cyan transition-all duration-500 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl",
    style: { width: object.width, height: object.height },
    children: [
      _jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              _jsx("div", {
                className: "p-1.5 bg-brand-cyan/20 rounded-lg text-brand-cyan",
                children: _jsx(Target, { size: 16 }),
              }),
              _jsx("div", {
                className:
                  "text-xs font-bold uppercase tracking-widest truncate max-w-[150px]",
                children: title,
              }),
            ],
          }),
          isComplete
            ? _jsx(CheckCircle2, { size: 14, className: "text-green-400" })
            : isRunning
              ? _jsx(Clock, {
                  size: 14,
                  className: "text-brand-cyan animate-pulse",
                })
              : null,
        ],
      }),
      _jsxs("div", {
        className: "flex flex-col gap-1.5 mt-2",
        children: [
          _jsxs("div", {
            className:
              "flex justify-between text-[10px] text-brand-text-muted font-bold uppercase tracking-tighter",
            children: [
              _jsx("span", { children: "Progress" }),
              _jsxs("span", { children: [Math.round(progress * 100), "%"] }),
            ],
          }),
          _jsx("div", {
            className:
              "w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner",
            children: _jsx("div", {
              className:
                "h-full bg-brand-cyan transition-all duration-500 shadow-[0_0_8px_rgba(0,194,255,0.4)]",
              style: { width: (progress * 100).toString() + "%" },
            }),
          }),
        ],
      }),
      _jsxs("div", {
        className:
          "flex items-center justify-between mt-auto pt-2 border-t border-white/5",
        children: [
          _jsx("div", {
            className:
              "text-[10px] text-brand-text-muted uppercase tracking-widest",
            children: object.status,
          }),
          _jsx("button", {
            className:
              "px-3 py-1 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded-md text-[10px] font-bold transition-all uppercase tracking-tighter",
            children: "Details",
          }),
        ],
      }),
    ],
  });
};
