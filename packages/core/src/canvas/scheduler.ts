export interface BlockNode {
  id: string;
  type?: string;
  execute: (input?: any) => Promise<any>;
  retryPolicy?: {
    maxRetries: number;
    baseDelayMs: number;
  };
}

export interface Edge {
  source: string;
  target: string;
  condition?: (output: any) => boolean;
  isLoopEdge?: boolean;
}

export interface CanvasGraph {
  nodes: BlockNode[];
  edges: Edge[];
}

export class CanvasScheduler {
  private maxIterations: number;

  constructor(options?: { maxIterations?: number }) {
    this.maxIterations = options?.maxIterations || 100000;
  }

  async run(graph: CanvasGraph): Promise<any> {
    const nodeMap = new Map<string, BlockNode>(graph.nodes.map(n => [n.id, n]));
    const outEdges = new Map<string, Edge[]>();
    const inDegree = new Map<string, number>();

    // Build graph ignoring loop edges for cycle detection
    graph.nodes.forEach(n => {
      outEdges.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    graph.edges.forEach(e => {
      outEdges.get(e.source)!.push(e);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    // Check for cycles ignoring loop edges
    let visitedCount = 0;
    const queue: string[] = [];
    const inDegreeClone = new Map(inDegree);
    
    // Adjust inDegreeClone to ignore loop edges for cycle detection
    graph.edges.forEach(e => {
      if (e.isLoopEdge) {
        inDegreeClone.set(e.target, inDegreeClone.get(e.target)! - 1);
      }
    });
    for (const [id, degree] of inDegreeClone.entries()) {
      if (degree === 0) queue.push(id);
    }
    while (queue.length > 0) {
      const curr = queue.shift()!;
      visitedCount++;
      const edges = outEdges.get(curr) || [];
      for (const edge of edges) {
        if (!edge.isLoopEdge) {
          const deg = inDegreeClone.get(edge.target)! - 1;
          inDegreeClone.set(edge.target, deg);
          if (deg === 0) queue.push(edge.target);
        }
      }
    }

    if (visitedCount !== graph.nodes.length) {
      throw new Error('Cyclic dependency detected');
    }

    // Execution queue
    const executionQueue: { id: string, input?: any }[] = [];
    // Start nodes
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) executionQueue.push({ id });
    }

    let iterations = 0;
    const outputs = new Map<string, any>();

    while (executionQueue.length > 0) {
      iterations++;
      if (iterations > this.maxIterations) {
        throw new Error('Circuit breaker: Maximum iterations exceeded');
      }

      const { id, input } = executionQueue.shift()!;
      const node = nodeMap.get(id);
      if (!node) continue;

      let output;
      let attempts = 0;
      const maxRetries = node.retryPolicy?.maxRetries || 0;
      const baseDelayMs = node.retryPolicy?.baseDelayMs || 0;

      while (true) {
        try {
          output = await node.execute(input);
          break; // Success
        } catch (error) {
          if (attempts >= maxRetries) {
            throw error; // Rethrow if exhausted
          }
          attempts++;
          const delay = baseDelayMs * Math.pow(2, attempts - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      outputs.set(id, output);

      const edges = outEdges.get(id) || [];
      
      if (node.type === 'ForEach' && output?.items && output.loopTarget) {
        // Special case for ForEach
        for (const item of output.items) {
          executionQueue.push({ id: output.loopTarget, input: item });
        }
      } else {
        for (const edge of edges) {
          if (!edge.condition || edge.condition(output)) {
             executionQueue.push({ id: edge.target, input: output });
          }
        }
      }
    }

    return { status: 'success', outputs };
  }
}