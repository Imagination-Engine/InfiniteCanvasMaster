import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { createNodeFromType, createNodeId } from "../nodes/nodeFactory";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "../nodes/canvasTypes";

export type ParsedAgentGraph = {
  nodes: UnifiedCanvasNode[];
  edges: UnifiedCanvasEdge[];
};

export type AgentGraphInput = {
  nodes: Array<{ type: string; label?: string; inputs?: Record<string, unknown>; config?: Record<string, unknown> }>;
  edges: Array<{ sourceIndex: number; targetIndex: number }>;
};

export function parseAgentGraph(input: AgentGraphInput, startX = 80, startY = 80): ParsedAgentGraph {
  const nodes: UnifiedCanvasNode[] = input.nodes
    .filter((node) => Boolean(NODE_CATALOG[node.type]))
    .map((node, index) => {
      const next = createNodeFromType(node.type, {
        x: startX + index * 340,
        y: startY,
      });

      return {
        ...next,
        data: {
          ...next.data,
          label: node.label ?? next.data.label,
          inputs: {
            ...next.data.inputs,
            ...(node.inputs ?? {}),
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
    const sourceNode = nodes[edge.sourceIndex];
    const targetNode = nodes[edge.targetIndex];
    if (!sourceNode || !targetNode) {
      continue;
    }

    edges.push({
      id: `edge-${createNodeId()}`,
      source: sourceNode.id,
      target: targetNode.id,
      type: "smoothstep",
    });
  }

  return { nodes, edges };
}
