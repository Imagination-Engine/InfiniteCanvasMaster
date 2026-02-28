import {
  useCallback,
  useRef,
  type DragEvent,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";

// React Flow's mandatory base styles (layout, handles, edges)
import "@xyflow/react/dist/style.css";

// Custom node type registry (see ./nodes/index.ts)
import { NODE_TYPES } from "./nodes";

// Block schema — factory for creating typed blocks
import { createBlock } from "../canvas/factories/blockFactory";
import type { BlockType } from "../canvas/types/blockTypes";

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

// ─── Initial Demo Data ──────────────────────────────────────────────
// Starter nodes so new users see something immediately.
// Feel free to clear these — the sidebar creates new ones via drag-and-drop.
const INITIAL_NODES: Node[] = [
  createBlock("content", {
    id: "demo-welcome",
    title: "Welcome to Imagination Canvas",
    position: { x: 250, y: 100 },
    content: {
      document: "# Welcome!\n\nThis is your new persistent workspace. Drag blocks from the sidebar to begin.\n\n*   **AI Agents** can read and write to these blocks.\n*   **Sandboxes** let you run code securely.\n*   **Images & Video** can be generated in-place.",
      format: "markdown"
    }
  }),
];

const INITIAL_EDGES: Edge[] = [];
 

// ─── Helpers ────────────────────────────────────────────────────────
let nodeIdCounter = 0;
const createNodeId = () =>
  `node-${Date.now()}-${nodeIdCounter++}`;

// ─── Canvas Component ───────────────────────────────────────────────

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
export default function Canvas() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState(INITIAL_EDGES);
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper =
    useRef<HTMLDivElement>(null);

  // ── Edge Connection ───────────────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(connection, current),
      );
    },
    [setEdges],
  );

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

      // New block types use the factory for fully-typed, schema-valid data.
      // Legacy types (trigger, action, etc.) still use the old { label } format
      // until their components are migrated to read from BlockData.
      if (isNewBlockType(blockType)) {
        setNodes((current) => [
          ...current,
          createBlock(blockType, { position }),
        ]);
      } else {
        // Legacy fallback — remove this branch as you migrate each old node
        setNodes((current) => [
          ...current,
          {
            id: createNodeId(),
            type: blockType,
            position,
            data: { label: `New ${blockType}` },
          },
        ]);
      }
    },
    [screenToFlowPosition, setNodes],
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full bg-[#0A0A0F]"
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
          className="!bg-[#111128]/80 !border-white/10"
        />
      </ReactFlow>
    </div>
  );
}
