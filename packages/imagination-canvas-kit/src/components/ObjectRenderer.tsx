import React, { memo, useRef, useState } from "react";
import type { CanvasObject } from "../contracts";
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
  const { setExpanded } = useExpansionStore();
  const { x: viewportX, y: viewportY, zoom: viewportZoom } = useViewportStore();
  const updateObject = useCanvasStore((s) => s.updateObject);
  const addConnection = useConnectionStore((s) => s.addConnection);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const screenW = window.innerWidth / viewportZoom;
  const screenH = window.innerHeight / viewportZoom;
  const canvasViewportX = -viewportX / viewportZoom;
  const canvasViewportY = -viewportY / viewportZoom;

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
      const dx = (moveEvent.clientX - startX) / viewportZoom;
      const dy = (moveEvent.clientY - startY) / viewportZoom;
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
    setExpanded(object.id, "fullscreen"); // or 'immersive'
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
      className={`absolute transition-shadow duration-200 border-2 border-red-500/50 ${isSelected ? "ring-2 ring-brand-cyan shadow-[0_0_20px_rgba(0,194,255,0.2)]" : ""} ${isHovered && !isSelected ? "ring-1 ring-white/30" : ""}`}
      style={{
        left: object.x,
        top: object.y,
        zIndex: object.zIndex,
        transform: `rotate(${(object as any).rotation || 0}deg)`,
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
        className="bg-gradient-to-br from-brand-bg-surface/95 to-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden group/block transition-all duration-300 hover:border-brand-cyan/20"
        style={{
          width: object.width,
          height: isCollapsed ? "auto" : object.height,
        }}
      >
        {/* Premium Canvas Block Header */}
        <div className="h-10 border-b border-white/5 flex items-center justify-between px-3 bg-gradient-to-r from-black/60 to-black/20 shrink-0 select-none group/header cursor-grab active:cursor-grabbing relative overflow-hidden">
          {/* Subtle running pulse if active */}
          {(object.status === "running" ||
            object.status === "thinking" ||
            object.status === "generating") && (
            <div className="absolute bottom-0 left-0 h-[2px] bg-brand-cyan shadow-[0_0_10px_rgba(0,194,255,0.8)] animate-[scan_2s_ease-in-out_infinite] w-1/3" />
          )}

          <div className="flex items-center gap-2 overflow-hidden z-10">
            <GripHorizontal
              size={12}
              className="text-white/20 opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0"
            />

            {/* Status indicator pip */}
            <div
              className={`w-1.5 h-1.5 rounded-full ${object.status === "error" ? "bg-red-500 animate-pulse" : object.status === "complete" ? "bg-green-500" : object.status === "running" || object.status === "thinking" || object.status === "generating" ? "bg-brand-cyan animate-pulse shadow-[0_0_8px_rgba(0,194,255,0.5)]" : "bg-white/20"}`}
            />

            <span className="text-[11px] font-black uppercase tracking-widest text-white truncate drop-shadow-md">
              {String(displayLabel)}
            </span>

            {displayLabel !== blockTypeLabel && (
              <span className="text-[8px] font-bold uppercase tracking-widest text-brand-text-muted truncate ml-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                {String(blockTypeLabel)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 z-10">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpanded(object.id, "side-panel")}
              className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all"
              title="Settings Inspector"
            >
              <Settings size={12} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all"
              title={isCollapsed ? "Expand" : "Minimize"}
            >
              {isCollapsed ? <ChevronDown size={12} /> : <Minus size={12} />}
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpanded(object.id, "fullscreen")}
              className="p-1 text-brand-cyan hover:text-black hover:bg-brand-cyan rounded-md transition-all ml-1 shadow-[0_0_10px_rgba(0,194,255,0.2)]"
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
