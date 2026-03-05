import { create } from "zustand";
import {
  type Connection,
  type EdgeChange,
  type NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { CanvasBlockNode, CanvasEdge, BlockType } from "../types/blockTypes";
import { createBlock } from "../factories/blockFactory";

interface CanvasState {
  // State
  nodes: CanvasBlockNode[];
  edges: CanvasEdge[];
  rfInstance: ReactFlowInstance | null;

  // Actions
  setRfInstance: (instance: ReactFlowInstance) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addBlock: (type: BlockType, position: { x: number; y: number }) => void;
  updateBlock: (id: string, data: Partial<CanvasBlockNode["data"]>) => void;
  removeBlock: (id: string) => void;
  
  // Batch Actions (for chat/AI updates)
  setCanvas: (nodes: CanvasBlockNode[], edges: CanvasEdge[]) => void;
}

const INITIAL_NODES: CanvasBlockNode[] = [
  createBlock("content", {
    id: "demo-welcome",
    title: "Welcome to Imagination Canvas",
    position: { x: 250, y: 100 },
    data: {
      document: "# Welcome!\n\nThis is your new persistent workspace. Drag blocks from the sidebar to begin.\n\n*   **AI Agents** can read and write to these blocks.\n*   **Sandboxes** let you run code securely.\n*   **Images & Video** can be generated in-place.",
      format: "markdown"
    }
  }),
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: [],
  rfInstance: null,

  setRfInstance: (instance) => set({ rfInstance: instance }),

  onNodesChange: (changes) => {
    // Cast to any because XYFlow types can be tricky with generics
    set({
      nodes: applyNodeChanges(changes, get().nodes) as unknown as CanvasBlockNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as unknown as CanvasEdge[],
    });
  },

  onConnect: (connection) => {
    // Prevent self-loops
    if (connection.source === connection.target) return;
    
    set({
      edges: addEdge(connection, get().edges) as unknown as CanvasEdge[],
    });
  },

  addBlock: (type, position) => {
    const newBlock = createBlock(type, { position });
    set({ nodes: [...get().nodes, newBlock] });
  },

  updateBlock: (id, partialData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== id) return node;
        
        return {
          ...node,
          data: {
            ...node.data,
            ...partialData,
            // Ensure meta/state merges correctly if provided partially
            meta: partialData.meta ? { ...node.data.meta, ...partialData.meta } : node.data.meta,
            state: partialData.state ? { ...node.data.state, ...partialData.state } : node.data.state,
          },
        };
      }),
    });
  },

  removeBlock: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  setCanvas: (nodes, edges) => {
    set({ nodes, edges });
  },
}));
