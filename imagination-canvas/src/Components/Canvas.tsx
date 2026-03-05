import {
  useCallback,
  useRef,
  useEffect,
  type DragEvent,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "@xyflow/react";

// React Flow's mandatory base styles (layout, handles, edges)
import "@xyflow/react/dist/style.css";

// Custom node type registry (see ./nodes/index.ts)
import { NODE_TYPES } from "./nodes";

// Block schema — factory for creating typed blocks
// import { createBlock } from "../canvas/factories/blockFactory"; // Unused now that addBlock handles it via store

import type { BlockType, CanvasDocument } from "../canvas/types/blockTypes";
import { useCanvasStore } from "../canvas/store/useCanvasStore";

// ─── Block Type Detection ───────────────────────────────────────────
// New block types that use the factory + BlockData schema.
// As you migrate old node components (trigger, action, etc.) to use BlockData,
// move them from the legacy path into this set.
const NEW_BLOCK_TYPES: Set<BlockType> = new Set([
  "content", "image", "video", "code", "chat", "sandbox",
  "product", "browser", "datatable", "listicle", "aigenerative", "audio", "group",
]);

/** Returns true if this type uses the new BlockData schema (vs legacy { label } data). */
function isNewBlockType(type: string): type is BlockType {
  return NEW_BLOCK_TYPES.has(type as BlockType);
}

// ─── Canvas Component ───────────────────────────────────────────────

type CanvasProps = {
  initialDocument?: CanvasDocument | null;
  // showDemo prop is available for legacy reasons but currently unused as store handles defaults
  showDemo?: boolean;
};

/**
 * Canvas — the main React Flow workspace.
 *
 * Responsibilities:
 *  1. Renders all nodes and edges
 *  2. Handles new connections between nodes
 *  3. Accepts drag-and-drop from the Sidebar to create new nodes
 *  4. Provides built-in pan, zoom, minimap, and controls
 *
 * MUST be rendered inside a <ReactFlowProvider> (see App.tsx).
 */
export default function Canvas({ initialDocument }: CanvasProps) {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addBlock,
    setCanvas
  } = useCanvasStore();
  
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Initialize canvas from prop
  useEffect(() => {
    if (initialDocument) {
      setCanvas(initialDocument.nodes, initialDocument.edges);
      if (initialDocument.viewport) {
        setViewport(initialDocument.viewport);
      }
    }
  }, [initialDocument, setCanvas, setViewport]);

  // ── Drag-and-Drop (paired with Sidebar's HTML5 DnD) ──────────────
  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const blockType =
        event.dataTransfer.getData(
          "application/reactflow",
        );
      if (!blockType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (isNewBlockType(blockType)) {
        addBlock(blockType, position);
      } else {
        // Legacy fallback - keeping for now but should ideally be removed
        // or adapted to use the store if possible, though addBlock expects typed BlockType
        console.warn("Dropped unsupported legacy block type:", blockType);
      }
    },
    [screenToFlowPosition, addBlock],
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full bg-brand-bg-page"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        colorMode="dark"
      >
        <Background
          gap={20}
          size={1}
          color="rgba(255, 255, 255, 0.05)"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          className="!bg-brand-bg-surface/80 !border-white/10"
        />
      </ReactFlow>
    </div>
  );
}
