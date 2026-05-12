import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useState } from "react";
import { useCanvasStore } from "../../state/canvasStore";
export const RichTextBlock = ({ object }) => {
  const [content, setContent] = useState(object.metadata.content || "");
  const updateObject = useCanvasStore((s) => s.updateObject);
  const handleBlur = () => {
    updateObject(object.id, { metadata: { ...object.metadata, content } });
  };
  return _jsxs("div", {
    className:
      "p-6 bg-brand-bg-surface border border-white/10 rounded-2xl shadow-xl text-white",
    style: { width: object.width, height: object.height },
    children: [
      _jsx("div", {
        className:
          "text-[10px] uppercase tracking-widest text-brand-text-muted mb-2",
        children: "Rich Text",
      }),
      _jsx("div", {
        contentEditable: true,
        className:
          "w-full h-full bg-transparent border-none focus:outline-none outline-none overflow-auto",
        onBlur: (e) => {
          setContent(e.currentTarget.innerText);
          handleBlur();
        },
        dangerouslySetInnerHTML: { __html: content },
      }),
    ],
  });
};
