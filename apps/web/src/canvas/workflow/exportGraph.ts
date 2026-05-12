export type WorkflowGraph = {
  nodes: Array<{
    id: string;
    type: string;
    data: { inputs?: Record<string, unknown> };
    label?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    condition?: string;
  }>;
};

type AnyShape = {
  id: string;
  type: string;
  props?: any;
  meta?: any;
};

export function exportWorkflowGraphFromShapes(
  shapes: AnyShape[],
): WorkflowGraph {
  const nodes: WorkflowGraph["nodes"] = [];
  const edges: WorkflowGraph["edges"] = [];

  for (const shape of shapes) {
    if (shape.type === "iem-block") {
      const nodeId = shape.meta?.iem?.nodeId || shape.id;
      const blockId = shape.props?.blockId;
      if (!blockId) continue;

      nodes.push({
        id: String(nodeId),
        type: String(blockId),
        label: shape.props?.label ? String(shape.props.label) : undefined,
        data: {
          inputs: (shape.props?.inputs || {}) as Record<string, unknown>,
        },
      });
    }
  }

  for (const shape of shapes) {
    if (shape.type !== "arrow") continue;
    const edgeMeta = shape.meta?.iemEdge;
    if (!edgeMeta?.sourceNodeId || !edgeMeta?.targetNodeId) continue;

    edges.push({
      id: shape.id,
      source: String(edgeMeta.sourceNodeId),
      target: String(edgeMeta.targetNodeId),
      condition: edgeMeta.condition ? String(edgeMeta.condition) : undefined,
    });
  }

  return { nodes, edges };
}
