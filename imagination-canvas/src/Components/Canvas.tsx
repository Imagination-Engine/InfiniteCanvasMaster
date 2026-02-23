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

// ─── Initial Demo Data ──────────────────────────────────────────────
// Starter nodes so new users see something immediately.
// Feel free to clear these — the sidebar creates new ones via drag-and-drop.
const INITIAL_NODES: Node[] = [
  {
    id: "demo-trigger",
    type: "trigger",
    position: { x: 250, y: 50 },
    data: { label: "On Form Submit" },
  },
  {
    id: "demo-filter",
    type: "filter",
    position: { x: 250, y: 200 },
    data: { label: "Is Valid?" },
  },
  {
    id: "demo-action",
    type: "action",
    position: { x: 150, y: 400 },
    data: { label: "Save to DB" },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: "e-trigger-filter",
    source: "demo-trigger",
    target: "demo-filter",
  },
  {
    id: "e-filter-action",
    source: "demo-filter",
    sourceHandle: "pass",
    target: "demo-action",
  },
];

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

      setNodes((current) => [
        ...current,
        {
          id: createNodeId(),
          type: blockType,
          position,
          data: { label: `New ${blockType}` },
        },
      ]);
    },
    [screenToFlowPosition, setNodes],
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full"
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
      >
        <Background
          gap={20}
          size={1.5}
          color="#cbd5e1"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
