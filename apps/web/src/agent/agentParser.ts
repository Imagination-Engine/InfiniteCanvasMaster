import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { createNodeFromType, createNodeId } from "../nodes/nodeFactory";
import type {
  UnifiedCanvasEdge,
  UnifiedCanvasNode,
} from "../nodes/canvasTypes";
import type { PlannerGraph } from "./schemas";

export type ParsedAgentGraph = {
  nodes: UnifiedCanvasNode[];
  edges: UnifiedCanvasEdge[];
};

export function parseAgentGraph(
  input: PlannerGraph,
  startX = 80,
  startY = 80,
): ParsedAgentGraph {
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
      sourceHandle: undefined,
      targetHandle: undefined,
      type: edge.type ?? "smoothstep",
      data: edge.data,
    });
  }

  return { nodes, edges };
}

/**
 * Compiles the React Flow / Tldraw canvas state into a JSON payload
 * that the Mastra backend can dynamically execute.
 */
export function compileToMastraWorkflow(
  nodes: any[],
  edges: any[],
  initialTriggerData = {},
) {
  const workflowName = `wf-${Date.now()}`;

  // Format for the backend execution runner
  return {
    workflowName,
    triggerData: initialTriggerData,
    document: {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data?.type || n.props?.blockId,
        config: n.data?.config || n.props?.config || {},
        inputs: n.data?.inputs || n.props?.inputs || {},
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source || e.fromId,
        target: e.target || e.toId,
        data: e.data || e.props || {},
      })),
    },
  };
}
