import { describe, it, expect, vi } from 'vitest';
import { CanvasScheduler, CanvasGraph, ExecutionContext } from './scheduler';

describe('CanvasScheduler', () => {
  it('executes a linear graph in topological order', async () => {
    const graph: CanvasGraph = {
      nodes: [
        { id: '1', execute: vi.fn().mockResolvedValue({ out: 1 }) },
        { id: '2', execute: vi.fn().mockResolvedValue({ out: 2 }) }
      ],
      edges: [{ source: '1', target: '2' }]
    };
    const scheduler = new CanvasScheduler();
    const result = await scheduler.run(graph);
    
    expect(graph.nodes[0].execute).toHaveBeenCalled();
    expect(graph.nodes[1].execute).toHaveBeenCalled();
    expect(result.status).toBe('success');
  });

  it('supports conditional routing (if branch)', async () => {
    const executeIf = vi.fn().mockResolvedValue({ branch: 'truePath' });
    const executeTrue = vi.fn().mockResolvedValue({});
    const executeFalse = vi.fn().mockResolvedValue({});

    const graph: CanvasGraph = {
      nodes: [
        { id: 'if_node', execute: executeIf },
        { id: 'true_node', execute: executeTrue },
        { id: 'false_node', execute: executeFalse }
      ],
      edges: [
        { source: 'if_node', target: 'true_node', condition: (out) => out.branch === 'truePath' },
        { source: 'if_node', target: 'false_node', condition: (out) => out.branch === 'falsePath' }
      ]
    };

    const scheduler = new CanvasScheduler();
    await scheduler.run(graph);

    expect(executeIf).toHaveBeenCalled();
    expect(executeTrue).toHaveBeenCalled();
    expect(executeFalse).not.toHaveBeenCalled();
  });

  it('supports loop execution (ForEach block)', async () => {
    const executeForEach = vi.fn().mockResolvedValue({ items: ['a', 'b'], loopTarget: 'loop_body' });
    const executeBody = vi.fn().mockResolvedValue({});

    const graph: CanvasGraph = {
      nodes: [
        { id: 'foreach', type: 'ForEach', execute: executeForEach },
        { id: 'loop_body', execute: executeBody }
      ],
      edges: [
        { source: 'foreach', target: 'loop_body', isLoopEdge: true }
      ]
    };

    const scheduler = new CanvasScheduler();
    await scheduler.run(graph);

    // Should be called twice, once for 'a' and once for 'b'
    expect(executeBody).toHaveBeenCalledTimes(2);
  });

  it('detects cyclic dependencies during toposort', async () => {
    const graph: CanvasGraph = {
      nodes: [
        { id: '1', execute: vi.fn() },
        { id: '2', execute: vi.fn() }
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '2', target: '1' }
      ]
    };

    const scheduler = new CanvasScheduler();
    await expect(scheduler.run(graph)).rejects.toThrow('Cyclic dependency detected');
  });

  it('adversarial: circuit breaker trips on infinite loop', async () => {
    const executeForEach = vi.fn().mockResolvedValue({ items: Array(10005).fill('x'), loopTarget: 'loop_body' });
    const executeBody = vi.fn().mockResolvedValue({});

    const graph: CanvasGraph = {
      nodes: [
        { id: 'foreach', type: 'ForEach', execute: executeForEach },
        { id: 'loop_body', execute: executeBody }
      ],
      edges: [
        { source: 'foreach', target: 'loop_body', isLoopEdge: true }
      ]
    };

    const scheduler = new CanvasScheduler({ maxIterations: 10000 });
    await expect(scheduler.run(graph)).rejects.toThrow('Circuit breaker: Maximum iterations exceeded');
  });

  it('supports retry policies with exponential backoff', async () => {
    let attempts = 0;
    const executeFlaky = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Network error');
      return { success: true };
    });

    const graph: CanvasGraph = {
      nodes: [
        { 
          id: '1', 
          execute: executeFlaky, 
          retryPolicy: { maxRetries: 3, baseDelayMs: 10 } 
        }
      ],
      edges: []
    };

    const scheduler = new CanvasScheduler();
    const result = await scheduler.run(graph);
    
    expect(attempts).toBe(3);
    expect(result.status).toBe('success');
    expect(result.outputs.get('1')).toEqual({ success: true });
  });

  it('fails if retries are exhausted', async () => {
    const executeFail = vi.fn().mockRejectedValue(new Error('Fatal error'));

    const graph: CanvasGraph = {
      nodes: [
        { 
          id: '1', 
          execute: executeFail, 
          retryPolicy: { maxRetries: 2, baseDelayMs: 5 } 
        }
      ],
      edges: []
    };

    const scheduler = new CanvasScheduler();
    await expect(scheduler.run(graph)).rejects.toThrow('Fatal error');
    expect(executeFail).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});