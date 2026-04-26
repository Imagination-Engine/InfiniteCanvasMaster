import React, { memo } from "react";
import { CanvasObject } from "../contracts";
import { useSelectionStore } from "../state/selectionStore";
import { useExpansionStore } from "../state/expansionStore";
import { useViewportStore } from "../state/viewportStore";
import { NoteBlock } from "./blocks/NoteBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { AgentBlock } from "./blocks/AgentBlock";

export type ComponentRegistry = Record<
  string,
  React.FC<{ object: CanvasObject }>
>;

const defaultRegistry: ComponentRegistry = {
  note: NoteBlock,
  "rich-text": RichTextBlock,
  agent: AgentBlock,
  shape: ({ object }) => (
    <div
      className="bg-brand-purple border-2 border-white/20 rounded-lg"
      style={{ width: object.width, height: object.height }}
    />
  ),
  image: ({ object }) => (
    <div
      className="bg-black/20 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-white/30"
      style={{ width: object.width, height: object.height }}
    >
      {object.metadata.url ? (
        <img
          src={object.metadata.url as string}
          className="w-full h-full object-cover"
          alt="Canvas"
        />
      ) : (
        <span>No Image</span>
      )}
    </div>
  ),
};

export const ObjectRenderer: React.FC<{
  object: CanvasObject;
  registry?: ComponentRegistry;
}> = memo(({ object, registry = defaultRegistry }) => {
  const { selectedIds, setSelection, setHovered, hoveredId } =
    useSelectionStore();
  const { setExpansion } = useExpansionStore();
  const viewport = useViewportStore((s) => s.viewport);

  // Simple Viewport Culling
  // We check if the object is within a reasonable buffer around the viewport.
  // Viewport center is at (0,0) in canvas space initially, but transformed by viewport.x, viewport.y.
  // Actually, objects are in canvas space. Viewport x/y are the top-left offset.
  // Buffer of 500px around the screen.
  const screenW = window.innerWidth / viewport.zoom;
  const screenH = window.innerHeight / viewport.zoom;
  const canvasViewportX = -viewport.x / viewport.zoom;
  const canvasViewportY = -viewport.y / viewport.zoom;

  const isVisible =
    object.x + object.width > canvasViewportX - 500 &&
    object.x < canvasViewportX + screenW + 500 &&
    object.y + object.height > canvasViewportY - 500 &&
    object.y < canvasViewportY + screenH + 500;

  if (!isVisible) return null;

  const isSelected = selectedIds.includes(object.id);
  const isHovered = hoveredId === object.id;

  const Component =
    registry[object.type] ||
    (({ object }) => (
      <div className="p-2 border border-dashed border-white/20 opacity-50 text-[10px]">
        Unknown: {object.type}
      </div>
    ));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelection(
        isSelected
          ? selectedIds.filter((id) => id !== object.id)
          : [...selectedIds, object.id],
      );
    } else {
      setSelection([object.id]);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpansion(object.id, "side-panel");
  };

  return (
    <div
      className={`absolute transition-shadow duration-200 ${isSelected ? "ring-2 ring-brand-cyan shadow-lg shadow-brand-cyan/20" : ""} ${isHovered && !isSelected ? "ring-1 ring-white/50" : ""}`}
      style={{
        left: object.x,
        top: object.y,
        zIndex: object.zIndex,
        transform: `rotate(${object.rotation}deg)`,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onPointerEnter={() => setHovered(object.id)}
      onPointerLeave={() => setHovered(null)}
    >
      <Component object={object} />
    </div>
  );
});

ObjectRenderer.displayName = "ObjectRenderer";
