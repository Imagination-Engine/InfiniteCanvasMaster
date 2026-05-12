import { jsx as _jsx } from "react/jsx-runtime";
// @ts-nocheck
import { useState } from "react";
import { useCanvasStore } from "../../state/canvasStore";
export const NoteBlock = ({ object }) => {
  const [text, setText] = useState(object.metadata.text || "");
  const updateObject = useCanvasStore((s) => s.updateObject);
  const handleBlur = () => {
    updateObject(object.id, { metadata: { ...object.metadata, text } });
  };
  return _jsx("div", {
    className: "w-full h-full",
    children: _jsx("textarea", {
      className:
        "w-full h-full bg-transparent border-none focus:outline-none resize-none overflow-hidden text-[13px] text-white/90 placeholder:text-white/20 leading-relaxed font-medium",
      value: text,
      onChange: (e) => setText(e.target.value),
      onBlur: handleBlur,
      placeholder: "Type a note...",
    }),
  });
};
