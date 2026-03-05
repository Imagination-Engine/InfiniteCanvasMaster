import type { Edge, Node, Viewport } from "@xyflow/react";
import type { BaseNodeData } from "./types";

export type UnifiedCanvasNode = Node<BaseNodeData, string>;
export type UnifiedCanvasEdge = Edge<{ valueType?: string; [key: string]: unknown }>;

export type UnifiedCanvasDocument = {
  nodes: UnifiedCanvasNode[];
  edges: UnifiedCanvasEdge[];
  viewport: Viewport;
};

export const DEFAULT_CANVAS_DOCUMENT: UnifiedCanvasDocument = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};
