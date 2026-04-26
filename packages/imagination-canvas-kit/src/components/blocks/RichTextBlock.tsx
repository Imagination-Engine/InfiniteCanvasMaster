import React, { useState } from "react";
import { CanvasObject } from "../../contracts";
import { useCanvasStore } from "../../state/canvasStore";

export const RichTextBlock: React.FC<{ object: CanvasObject }> = ({
  object,
}) => {
  const [content, setContent] = useState(
    (object.metadata.content as string) || "",
  );
  const updateObject = useCanvasStore((s) => s.updateObject);

  const handleBlur = () => {
    updateObject(object.id, { metadata: { ...object.metadata, content } });
  };

  return (
    <div
      className="p-6 bg-brand-bg-surface border border-white/10 rounded-2xl shadow-xl text-white"
      style={{ width: object.width, height: object.height }}
    >
      <div className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">
        Rich Text
      </div>
      <div
        contentEditable
        className="w-full h-full bg-transparent border-none focus:outline-none outline-none overflow-auto"
        onBlur={(e) => {
          setContent(e.currentTarget.innerText);
          handleBlur();
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
