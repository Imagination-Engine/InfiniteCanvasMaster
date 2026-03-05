import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { createNodeFromType, createNodeId } from "../nodes/nodeFactory";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "../nodes/canvasTypes";
import type { PlannerGraph } from "./schemas";

export type ParsedAgentGraph = {
  nodes: UnifiedCanvasNode[];
  edges: UnifiedCanvasEdge[];
};

export function parseAgentGraph(input: PlannerGraph, startX = 80, startY = 80): ParsedAgentGraph {
  const idMap = new Map<string, string>();

  const nodes: UnifiedCanvasNode[] = input.nodes
    .filter((node) => Boolean(NODE_CATALOG[node.type]))
    .map((node, index) => {
      const next = createNodeFromType(node.type, {
        x: startX + (index % 4) * 340,
        y: startY + Math.floor(index / 4) * 260,
      });

      idMap.set(node.id, next.id);

      return {
        ...next,
        data: {
          ...next.data,
          label: node.label ?? next.data.label,
          description: node.description ?? next.data.description,
          inputs: {
            ...next.data.inputs,
            ...(node.inputs ?? {}),
          },
          outputs: {
            ...(next.data.outputs ?? {}),
            ...(node.outputs ?? {}),
          },
          config: {
            ...(next.data.config ?? {}),
            ...(node.config ?? {}),
          },
        },
      };
    });

  const edges: UnifiedCanvasEdge[] = [];
  for (const edge of input.edges) {
    const sourceNodeId = idMap.get(edge.source);
    const targetNodeId = idMap.get(edge.target);
    if (!sourceNodeId || !targetNodeId) {
      continue;
    }

    edges.push({
      id: edge.id || `edge-${createNodeId()}`,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type ?? "smoothstep",
      data: edge.data,
    });
  }

  return { nodes, edges };
}
