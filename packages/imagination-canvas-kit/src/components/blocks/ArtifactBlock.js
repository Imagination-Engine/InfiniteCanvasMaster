import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FileText, ExternalLink } from "lucide-react";
import { useViewportStore } from "../../state/viewportStore";
export const ArtifactBlock = ({ object }) => {
  const zoom = useViewportStore((s) => s.zoom);
  const title = object.metadata?.title || "Untitled Artifact";
  const content = object.metadata?.content || "";
  const isFarOut = zoom < 0.4;
  return _jsxs("div", {
    className:
      "p-4 bg-brand-bg-surface border border-white/10 rounded-2xl shadow-2xl text-white flex flex-col gap-3 backdrop-blur-xl",
    style: { width: object.width, height: object.height },
    children: [
      _jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              _jsx("div", {
                className: "p-1.5 bg-white/5 rounded-lg text-brand-text-muted",
                children: _jsx(FileText, { size: 16 }),
              }),
              _jsx("div", {
                className:
                  "text-xs font-bold uppercase tracking-widest truncate",
                children: title,
              }),
            ],
          }),
          _jsx(ExternalLink, { size: 14, className: "text-white/20" }),
        ],
      }),
      !isFarOut
        ? _jsx("div", {
            className:
              "flex-1 text-[11px] text-brand-text-body leading-relaxed overflow-auto custom-scrollbar pr-1",
            children: content,
          })
        : _jsx("div", {
            className: "flex-1 flex items-center justify-center",
            children: _jsx("div", {
              className: "w-full h-2 bg-white/5 rounded-full animate-pulse",
            }),
          }),
      _jsxs("div", {
        className:
          "mt-auto pt-2 border-t border-white/5 flex justify-between items-center",
        children: [
          _jsx("div", {
            className:
              "text-[9px] text-brand-text-muted uppercase tracking-tighter",
            children: "Artifact",
          }),
          _jsxs("div", {
            className: "text-[9px] text-brand-text-muted italic",
            children: [content.length, " chars"],
          }),
        ],
      }),
    ],
  });
};
