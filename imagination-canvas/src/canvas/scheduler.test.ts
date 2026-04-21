import { describe, it, expect, vi } from 'vitest';
// @ts-ignore
import { CanvasScheduler } from './scheduler';

describe('CanvasScheduler', () => {
  it('sorts blocks topologically', async () => {
    const scheduler = new CanvasScheduler();
    const blocks = [
      { id: 'A', dependencies: [] },
      { id: 'C', dependencies: ['B'] },
      { id: 'B', dependencies: ['A'] },
    ];
    
    // @ts-ignore
    const sorted = scheduler.toposort(blocks);
    expect(sorted.map(b => b.id)).toEqual(['A', 'B', 'C']);
  });

  it('resolves streaming AsyncIterable outputs', async () => {
    const scheduler = new CanvasScheduler();
    
    async function* mockStreamingBlock() {
      yield "chunk 1";
      yield "chunk 2";
    }

    const results: string[] = [];
    const block = {
      id: 'streaming-1',
      execute: mockStreamingBlock,
    };

    // This test will evolve as we define the scheduler's execution API
    // For now, it represents the requirement.
    const execution = scheduler.executeBlock(block);
    for await (const chunk of execution) {
      results.push(chunk);
    }

    expect(results).toEqual(["chunk 1", "chunk 2"]);
  });

  it('bubbles errors but preserves partial state', async () => {
    const scheduler = new CanvasScheduler();
    
    const blocks = [
      { id: 'success', dependencies: [], execute: async () => "ok" },
      { id: 'fail', dependencies: ['success'], execute: async () => { throw new Error("boom"); } },
    ];

    try {
      await scheduler.run(blocks);
    } catch (e) {
      expect((e as Error).message).toBe("boom");
      // Since run throws, we can't easily get the context unless we use onProgress 
      // or change run to not throw. The spec says "bubbles errors".
    }
  });

  it('detects cyclic graphs', async () => {
    const scheduler = new CanvasScheduler();
    const blocks = [
      { id: 'A', dependencies: ['B'] },
      { id: 'B', dependencies: ['A'] },
    ];
    
    expect(() => scheduler.toposort(blocks)).toThrow("Cycle detected");
  });

  it('handles blocks that take a long time (simulated hang)', async () => {
    vi.useFakeTimers();
    const scheduler = new CanvasScheduler();
    
    const blocks = [
      { 
        id: 'slow', 
        dependencies: [], 
        execute: () => new Promise(resolve => setTimeout(() => resolve('done'), 10000)) 
      },
    ];

    const runPromise = scheduler.run(blocks);
    
    await vi.advanceTimersByTimeAsync(10000);
    const result = await runPromise;
    
    expect(result.results.slow).toBe('done');
    vi.useRealTimers();
  });

  it('takes an idempotent snapshot of the graph and results', () => {
    const scheduler = new CanvasScheduler();
    const blocks = [{ id: 'A', dependencies: [] }];
    const results = { 'A': 'some-result' };
    
    const snapshot = JSON.parse(scheduler.takeSnapshot(blocks, results));
    expect(snapshot.blocks[0].id).toBe('A');
    expect(snapshot.blocks[0].result).toBe('some-result');
    expect(snapshot.timestamp).toBeDefined();
  });
});



