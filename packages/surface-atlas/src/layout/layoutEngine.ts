import dagre from 'dagre';

export interface LayoutNode {
  id: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

export async function performLayout(nodes: LayoutNode[], edges: LayoutEdge[]): Promise<LayoutNode[]> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  // Standard React Flow node width/height fallback
  const nodeWidth = 172;
  const nodeHeight = 36;

  nodes.forEach((node) => {
    g.setNode(node.id, { 
      width: node.width || nodeWidth, 
      height: node.height || nodeHeight 
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
      },
    };
  });
}