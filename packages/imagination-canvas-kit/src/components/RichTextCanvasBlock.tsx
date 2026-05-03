import React, { useCallback } from "react";
import { useSelectionStore } from "../state/selectionStore";
import { BaseCanvasObject } from "../contracts";

interface RichTextCanvasBlockProps {
  block: BaseCanvasObject & { data?: any };
}

export const RichTextCanvasBlock: React.FC<RichTextCanvasBlockProps> = ({
  block,
}) => {
  const { editingId, setEditing } = useSelectionStore();
  const isEditing = editingId === block.id;

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (block.capabilities?.canEditInline) {
        setEditing(block.id);
        e.stopPropagation();
      }
    },
    [block.id, block.capabilities?.canEditInline, setEditing],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing && e.key === "Escape") {
        setEditing(null);
        e.stopPropagation();
      }
    },
    [isEditing, setEditing],
  );

  const stopPropagationIfEditing = useCallback(
    (e: any) => {
      if (isEditing) {
        e.stopPropagation();
      }
    },
    [isEditing],
  );

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onWheel={stopPropagationIfEditing}
      onPointerDown={stopPropagationIfEditing}
      onPointerMove={stopPropagationIfEditing}
      style={{
        width: "100%",
        height: "100%",
        padding: "8px",
        border: isEditing ? "2px solid blue" : "1px solid gray",
        backgroundColor: "white",
        cursor: isEditing ? "text" : "pointer",
      }}
    >
      {isEditing ? (
        <div
          className="rich-text-editor"
          contentEditable
          suppressContentEditableWarning
          style={{ width: "100%", height: "100%", outline: "none" }}
        >
          {block.data?.content || ""}
        </div>
      ) : (
        <div>{block.data?.content || ""}</div>
      )}
    </div>
  );
};
