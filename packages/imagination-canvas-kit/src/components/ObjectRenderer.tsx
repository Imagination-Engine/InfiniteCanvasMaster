import React, { memo, useRef, useState } from "react";
import { CanvasObject } from "../contracts";
import { useSelectionStore } from "../state/selectionStore";
import { useExpansionStore } from "../state/expansionStore";
import { useViewportStore } from "../state/viewportStore";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";
import { BlockRegistry } from "../contracts/BlockRegistry";
import { NoteBlock } from "./blocks/NoteBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { AgentBlock } from "./blocks/AgentBlock";
import { OpenClawBlock as OpenClawBlockComponent } from "./blocks/OpenClawBlock";
import { OpenClawAgentGroupBlock } from "./blocks/OpenClawAgentGroupBlock";
import { CommonBlockView } from "./blocks/CommonBlockView";
import {
  Settings,
  Minus,
  Maximize2,
  ChevronDown,
  GripHorizontal,
} from "lucide-react";

export type ComponentRegistry = Record<
  string,
  React.FC<{ object?: CanvasObject; data?: any; onParamsChange?: any }>
>;

const defaultRegistry: ComponentRegistry = {
  note: NoteBlock as any,
  "rich-text": RichTextBlock as any,
  agent: AgentBlock as any,
  "openclaw-block": OpenClawBlockComponent as any,
  "openclaw.block": OpenClawBlockComponent as any,
  "openclaw.agent_group": OpenClawAgentGroupBlock as any,
};

export const ObjectRenderer: React.FC<{
  object: CanvasObject;
  registry?: ComponentRegistry;
}> = memo(({ object, registry = defaultRegistry }) => {
  const { selectedIds, setSelection, setHovered, hoveredId } =
    useSelectionStore();
  const { setExpansion } = useExpansionStore();
  const viewport = useViewportStore((s) => s.viewport);
  const updateObject = useCanvasStore((s) => s.updateObject);
  const addConnection = useConnectionStore((s) => s.addConnection);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const screenW = window.innerWidth / viewport.zoom;
  const screenH = window.innerHeight / viewport.zoom;
  const canvasViewportX = -viewport.x / viewport.zoom;
  const canvasViewportY = -viewport.y / viewport.zoom;

  const isVisible =
    object.x + object.width > canvasViewportX - 1500 &&
    object.x < canvasViewportX + screenW + 1500 &&
    object.y + object.height > canvasViewportY - 1500 &&
    object.y < canvasViewportY + screenH + 1500;

  if (!isVisible) return null;

  const isSelected = selectedIds.includes(object.id);
  const isHovered = hoveredId === object.id;

  const Component =
    BlockRegistry.resolve((object as any).blockKind) ||
    BlockRegistry.resolve(object.type) ||
    registry[object.type] ||
    CommonBlockView;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();

    // Handle shift-click for multi-select
    if (e.shiftKey) {
      setSelection(
        isSelected
          ? selectedIds.filter((id) => id !== object.id)
          : [...selectedIds, object.id],
      );
      return;
    }

    setSelection([object.id]);

    // Handle Dragging
    const startX = e.clientX;
    const startY = e.clientY;
    const initialObjX = object.x;
    const initialObjY = object.y;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / viewport.zoom;
      const dy = (moveEvent.clientY - startY) / viewport.zoom;
      updateObject(object.id, { x: initialObjX + dx, y: initialObjY + dy });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpansion(object.id, "modal"); // or 'immersive'
  };

  // Polyfill data bridging for block registry views
  const handleParamsChange = (newParams: any) => {
    updateObject(object.id, {
      metadata: {
        ...object.metadata,
        inputs: {
          ...(object.metadata.inputs || {}),
          ...newParams,
        },
      },
    });
  };

  const polyfilledData = {
    input: object.metadata.inputs || object.metadata || {},
    output: object.metadata.outputs || {},
  };

  const blockTypeLabel = object.type.split(".").pop() || "";
  const displayLabel =
    object.metadata?.label || object.metadata?.title || blockTypeLabel;

  return (
    <div
      className={`absolute transition-shadow duration-200 ${isSelected ? "ring-2 ring-brand-cyan shadow-[0_0_20px_rgba(0,194,255,0.2)]" : ""} ${isHovered && !isSelected ? "ring-1 ring-white/30" : ""}`}
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
      // Connection drop handling
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/iem-connection")) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        const sourceId = e.dataTransfer.getData("application/iem-connection");
        if (sourceId && sourceId !== object.id) {
          addConnection({
            id: `edge-${Date.now()}`,
            fromId: sourceId,
            toId: object.id,
          });
        }
      }}
    >
      <div
        className="bg-brand-bg-surface/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          width: object.width,
          height: isCollapsed ? "auto" : object.height,
        }}
      >
        {/* "Browser" Window Chrome / Title Bar */}
        <div className="h-9 border-b border-white/5 flex items-center justify-between px-3 bg-black/40 shrink-0 select-none group/header cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2 overflow-hidden">
            <GripHorizontal
              size={12}
              className="text-white/20 opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan truncate">
              {String(displayLabel)}
            </span>
            {displayLabel !== blockTypeLabel && (
              <span className="text-[8px] font-bold uppercase tracking-widest text-brand-text-muted truncate ml-1 px-1.5 py-0.5 rounded bg-white/5">
                {String(blockTypeLabel)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpansion(object.id, "side-panel")}
              className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Settings Inspector"
            >
              <Settings size={12} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title={isCollapsed ? "Expand" : "Minimize"}
            >
              {isCollapsed ? <ChevronDown size={12} /> : <Minus size={12} />}
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpansion(object.id, "modal")}
              className="p-1.5 text-white/20 hover:text-brand-cyan hover:bg-brand-cyan/10 rounded-lg transition-all"
              title="Immersive View"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>

        {/* Inner Content Body */}
        {!isCollapsed && (
          <div className="flex-1 p-3 overflow-hidden custom-scrollbar">
            <Component
              object={object}
              data={polyfilledData}
              onParamsChange={handleParamsChange}
            />
          </div>
        )}
      </div>

      {/* Right Connector Handle for outgoing connections */}
      {!isCollapsed && (
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-crosshair opacity-0 hover:opacity-100 transition-opacity"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/iem-connection", object.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="w-3 h-3 bg-brand-cyan rounded-full border border-white/20 shadow-lg shadow-brand-cyan/50" />
        </div>
      )}
    </div>
  );
});

ObjectRenderer.displayName = "ObjectRenderer";
