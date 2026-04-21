export interface Block {
  id: string;
  dependencies: string[];
  execute?: () => Promise<any> | AsyncIterable<any>;
}

export interface ExecutionContext {
  results: Record<string, any>;
  status: 'idle' | 'running' | 'done' | 'error';
  error?: any;
}

export class CanvasScheduler {
  toposort(blocks: Block[]): Block[] {
    const nodes = new Map<string, Block>(blocks.map(b => [b.id, b]));
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const id of nodes.keys()) {
      adj.set(id, []);
      inDegree.set(id, 0);
    }

    for (const block of blocks) {
      for (const dep of block.dependencies) {
        if (!nodes.has(dep)) continue; // Ignore external dependencies for now
        adj.get(dep)!.push(block.id);
        inDegree.set(block.id, (inDegree.get(block.id) || 0) + 1);
      }
    }

    const queue: string[] = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([id, _]) => id);

    const sorted: Block[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      sorted.push(nodes.get(u)!);

      for (const v of adj.get(u) || []) {
        const newDegree = inDegree.get(v)! - 1;
        inDegree.set(v, newDegree);
        if (newDegree === 0) queue.push(v);
      }
    }

    if (sorted.length !== blocks.length) {
      throw new Error("Cycle detected or missing dependency in block graph");
    }

    return sorted;
  }

  async *executeBlock(block: Block): AsyncIterable<any> {
    if (!block.execute) return;
    
    const result = await block.execute();
    
    if (this.isAsyncIterable(result)) {
      yield* result;
    } else {
      yield result;
    }
  }

  private isAsyncIterable(obj: any): obj is AsyncIterable<any> {
    return obj && typeof obj === 'object' && Symbol.asyncIterator in obj;
  }

  async run(blocks: Block[], onProgress?: (context: ExecutionContext) => void): Promise<ExecutionContext> {
    const context: ExecutionContext = {
      results: {},
      status: 'running',
    };

    const sorted = this.toposort(blocks);
    
    for (const block of sorted) {
      try {
        let lastValue: any;
        for await (const chunk of this.executeBlock(block)) {
          lastValue = chunk;
        }
        context.results[block.id] = lastValue;
        onProgress?.({ ...context });
      } catch (error) {
        context.status = 'error';
        context.error = error;
        onProgress?.({ ...context });
        throw error;
      }
    }
    
    context.status = 'done';
    onProgress?.({ ...context });
    return context;
  }

  takeSnapshot(blocks: Block[], results: Record<string, any>): string {
    const snapshot = {
      timestamp: new Date().toISOString(),
      blocks: blocks.map(b => ({
        id: b.id,
        dependencies: b.dependencies,
        result: results[b.id]
      }))
    };
    return JSON.stringify(snapshot);
  }
}
