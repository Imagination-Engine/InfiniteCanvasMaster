import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useState } from "react";
import { AppWindow, RefreshCw, ShieldAlert } from "lucide-react";
export const AppBlock = ({ object }) => {
  const [key, setKey] = useState(0);
  const appUrl = object.metadata?.appUrl || "";
  const title = object.metadata?.title || "External App";
  const isLoading = object.status === "idle" || object.status === "thinking";
  const isError = object.status === "error";
  const handleRefresh = () => setKey((prev) => prev + 1);
  return _jsxs("div", {
    className:
      "w-full h-full bg-brand-bg-surface border border-white/10 rounded-2xl shadow-2xl text-white flex flex-col overflow-hidden backdrop-blur-xl",
    children: [
      _jsxs("div", {
        className:
          "h-8 bg-black/20 border-b border-white/5 flex items-center justify-between px-3 shrink-0",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-2 overflow-hidden",
            children: [
              _jsx(AppWindow, { size: 14, className: "text-brand-cyan" }),
              _jsx("span", {
                className:
                  "text-[10px] font-bold uppercase tracking-widest truncate",
                children: title,
              }),
            ],
          }),
          _jsx("button", {
            onClick: handleRefresh,
            className:
              "p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white",
            children: _jsx(RefreshCw, { size: 12 }),
          }),
        ],
      }),
      _jsxs("div", {
        className: "flex-1 relative bg-white/[0.02]",
        children: [
          isLoading &&
            _jsxs("div", {
              className:
                "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-brand-bg-surface/80 backdrop-blur-md",
              children: [
                _jsx("div", {
                  className:
                    "w-8 h-8 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin",
                }),
                _jsx("div", {
                  className:
                    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan animate-pulse",
                  children: "Initializing Runtime...",
                }),
              ],
            }),
          isError &&
            _jsxs("div", {
              className:
                "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-red-950/20 backdrop-blur-md",
              children: [
                _jsx(ShieldAlert, { size: 32, className: "text-red-500" }),
                _jsx("div", {
                  className:
                    "text-[10px] font-black uppercase tracking-[0.2em] text-red-500",
                  children: "Runtime Error",
                }),
                _jsx("button", {
                  onClick: handleRefresh,
                  className:
                    "px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-500 uppercase tracking-widest",
                  children: "Restart",
                }),
              ],
            }),
          appUrl
            ? _jsx(
                "iframe",
                {
                  src: appUrl,
                  title: title,
                  className: "w-full h-full border-none",
                  sandbox:
                    "allow-scripts allow-same-origin allow-forms allow-popups",
                  loading: "lazy",
                },
                key,
              )
            : _jsx("div", {
                className:
                  "flex-1 flex items-center justify-center text-[10px] text-brand-text-muted italic",
                children: "No URL provided for app runtime.",
              }),
        ],
      }),
    ],
  });
};
