// @ts-nocheck
import React, { useState, useEffect } from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";
import { useCanvasStore } from "../../state/canvasStore";

export const NoteBlock: React.FC<BlockComponentProps> = ({ object }) => {
  const [text, setText] = useState((object.metadata.text as string) || "");
  const updateObject = useCanvasStore((s) => s.updateObject);

  const handleBlur = () => {
    updateObject(object.id, { metadata: { ...object.metadata, text } });
  };

  return (
    <div className="w-full h-full">
      <textarea
        className="w-full h-full bg-transparent border-none focus:outline-none resize-none overflow-hidden text-[13px] text-white/90 placeholder:text-white/20 leading-relaxed font-medium"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Type a note..."
      />
    </div>
  );
};
