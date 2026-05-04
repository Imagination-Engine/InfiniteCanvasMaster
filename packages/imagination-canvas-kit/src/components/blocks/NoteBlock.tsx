import React, { useState, useEffect } from "react";
import type { CanvasObject } from "../../contracts";
import { useCanvasStore } from "../../state/canvasStore";
import { useSelectionStore } from "../../state/selectionStore";

export const NoteBlock: React.FC<{ object: CanvasObject }> = ({ object }) => {
  const [text, setText] = useState((object.metadata.text as string) || "");
  const updateObject = useCanvasStore((s) => s.updateObject);
  const isSelected = useSelectionStore((s) =>
    s.selectedIds.includes(object.id),
  );

  const handleBlur = () => {
    updateObject(object.id, { metadata: { ...object.metadata, text } });
  };

  return (
    <div
      className="p-4 bg-yellow-100 border border-yellow-400 rounded shadow-md text-black"
      style={{ width: object.width, height: object.height }}
    >
      <textarea
        className="w-full h-full bg-transparent border-none focus:outline-none resize-none overflow-hidden"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Type a note..."
      />
    </div>
  );
};
