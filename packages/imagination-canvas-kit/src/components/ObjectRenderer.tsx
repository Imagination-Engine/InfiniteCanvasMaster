// @ts-nocheck
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
import { resolveBlockIcon } from "../utils/blockIconMap";
import { Maximize2, GripHorizontal, Activity, AlertCircle } from "lucide-react";
import { studioInteropResolver } from "@iem/core";

export type ComponentRegistry = Record<
  string,
  React.FC<{
    object?: CanvasObject;
    data?: any;
    mode?: string;
    onParamsChange?: any;
  }>
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

  const [isDragging, setIsDragging] = useState(false);
  const [isExpandHovered, setIsExpandHovered] = useState(false);

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

    if (e.shiftKey) {
      setSelection(
        isSelected
          ? selectedIds.filter((id) => id !== object.id)
          : [...selectedIds, object.id],
      );
      return;
    }

    setSelection([object.id]);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialObjX = object.x;
    const initialObjY = object.y;

    let moved = false;

    const onMove = (moveEvent: PointerEvent) => {
      if (!moved) {
        setIsDragging(true);
        moved = true;
      }
      const dx = (moveEvent.clientX - startX) / viewportZoom;
      const dy = (moveEvent.clientY - startY) / viewportZoom;
      updateObject(object.id, { x: initialObjX + dx, y: initialObjY + dy });
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(object.id, "fullscreen");
  };

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

  const BlockIcon = resolveBlockIcon(
    object.type,
    object.metadata?.category,
    (object as any).studio,
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "running":
      case "thinking":
      case "generating":
        return "text-brand-cyan";
      case "error":
        return "text-rose-400";
      case "waiting-for-user":
      case "waiting_for_approval":
        return "text-amber-400";
      case "idle":
      default:
        return "text-white/20";
    }
  };

  // HITL status
  const isWaiting =
    object.status === "waiting-for-user" ||
    object.status === "waiting_for_approval";

  return (
    <div
      className={`absolute transition-all duration-300 ${isSelected ? "z-[1000] ring-2 ring-brand-cyan shadow-[0_0_40px_rgba(0,194,255,0.3)] scale-[1.01]" : "z-[10] shadow-xl"} ${isHovered && !isSelected ? "ring-1 ring-white/30" : ""} ${isDragging ? "z-[10000] scale-[1.03] shadow-2xl opacity-90 cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: object.x,
        top: object.y,
        transform: `rotate(${(object as any).rotation || 0}deg)`,
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onPointerEnter={() => setHovered(object.id)}
      onPointerLeave={() => setHovered(null)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/iem-connection")) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        const sourceId = e.dataTransfer.getData("application/iem-connection");
        if (!sourceId || sourceId === object.id) return;

        const sourceObj = useCanvasStore.getState().objects[sourceId];
        const sourceKind =
          (sourceObj as any)?.blockKind || sourceObj?.type || sourceId;
        const targetKind = (object as any).blockKind || object.type;

        if (!studioInteropResolver.canConnectBlocks(sourceKind, targetKind)) {
          e.preventDefault();
          return;
        }

        addConnection({
          id: `edge-${Date.now()}`,
          fromId: sourceId,
          toId: object.id,
        });
      }}
    >
      {/* Left Input Connector Handle */}
      <div
        title="Input — connect upstream"
        className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center transition-opacity duration-300 z-20 ${isHovered ? "opacity-100" : "opacity-0"}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="w-2.5 h-2.5 bg-brand-cyan/80 border border-white/20 shadow-lg shadow-brand-cyan/50 rounded-sm" />
      </div>

      <div
        className={`bg-gradient-to-br from-brand-bg-surface/95 to-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden group/block transition-all duration-300 ${isHovered || isSelected ? "border-brand-cyan/20" : ""}`}
        style={{
          width: object.width,
          height: object.height,
        }}
      >
        {/* Premium Canvas Block Header */}
        <div className="h-10 border-b border-white/5 flex items-center justify-between px-3 bg-gradient-to-r from-black/60 to-black/20 shrink-0 select-none group/header relative overflow-hidden">
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

            {/* Block Icon */}
            <div className="text-brand-cyan flex items-center justify-center">
              <BlockIcon size={14} />
            </div>

            <span className="text-[11px] font-black uppercase tracking-widest text-white truncate drop-shadow-md">
              {String(displayLabel)}
            </span>

            {isWaiting && (
              <div
                data-testid="hitl-indicator"
                className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"
                title="Decision Needed"
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 z-10">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsExpandHovered(true)}
              onMouseLeave={() => setIsExpandHovered(false)}
              onPointerUp={(e) => {
                e.stopPropagation();
                setExpanded(object.id, "fullscreen");
              }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(object.id, "fullscreen");
              }}
              className="p-1.5 text-brand-cyan hover:bg-brand-cyan rounded-md transition-all ml-1 shadow-[0_0_10px_rgba(0,194,255,0.2)]"
              title="Expand"
            >
              <Maximize2
                size={14}
                stroke={isExpandHovered ? "black" : "currentColor"}
                className="transition-colors"
              />
            </button>
          </div>
        </div>

        {/* Inner Content Body */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
          {/* Primary Role/Purpose */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-tighter text-white/30">
              {object.metadata?.role || object.type.split(".")[1] || "Process"}
            </span>
            <div className="flex items-center gap-1">
              <Activity size={10} className="text-white/20" />
              <span
                data-testid="block-status"
                className={`text-[10px] font-bold uppercase tracking-widest ${getStatusColor(object.status)}`}
              >
                {object.status || "idle"}
              </span>
            </div>
          </div>

          {/* Description / Purpose Line */}
          {object.metadata?.description && (
            <p
              data-testid="block-description"
              className="text-[10px] text-white/40 italic leading-relaxed line-clamp-2 mb-3"
            >
              {object.metadata.description}
            </p>
          )}

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar mb-4 pr-1">
            <Component
              object={object}
              mode="compact"
              data={polyfilledData}
              onParamsChange={handleParamsChange}
            />
          </div>

          {/* Footer: Capabilities & Runtime */}
          <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex gap-1.5 overflow-hidden">
              {((object.metadata?.capabilities as string[]) || [])
                .slice(0, 2)
                .map((cap) => (
                  <span
                    key={cap}
                    className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-white/40 lowercase truncate max-w-[80px]"
                  >
                    {cap}
                  </span>
                ))}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <div
                className={`w-1 h-1 rounded-full ${object.status === "error" ? "bg-red-500" : "bg-emerald-500"}`}
              />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                {object.metadata?.runtime || "LIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Output Connector Handle */}
      <div
        title="Output — drag to connect"
        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center cursor-crosshair transition-opacity duration-300 z-20 ${isHovered ? "opacity-100" : "opacity-0"}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/iem-connection", object.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="w-2.5 h-2.5 bg-brand-cyan/80 border border-white/20 shadow-lg shadow-brand-cyan/50 rounded-sm" />
      </div>
    </div>
  );
});

ObjectRenderer.displayName = "ObjectRenderer";
