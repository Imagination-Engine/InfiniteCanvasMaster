import { describe, it, expect } from 'vitest';
import { performLayout } from './layoutEngine';

describe('Auto-Layout Engine (Red/Green Phase)', () => {
  it('updates node coordinates using dagre', async () => {
    const nodes = [
      { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
      { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 0 } }
    ];
    const edges = [
      { id: 'e1', source: '1', target: '2' }
    ];

    const layoutedNodes = await performLayout(nodes, edges);
    
    // We expect the layout engine to have moved node 2 relative to node 1
    expect(layoutedNodes[0].position.x).toBeDefined();
    expect(layoutedNodes[0].position.y).toBeDefined();
    expect(layoutedNodes[1].position.x).toBeDefined();
    expect(layoutedNodes[1].position.y).toBeDefined();
    
    // Y position should typically increase for directed graphs going top-down
    expect(layoutedNodes[1].position.y).toBeGreaterThan(layoutedNodes[0].position.y);
  });

  describe('Adversarial Scenarios', () => {
    it('adversarial: handles massive, highly-connected graphs without crashing', async () => {
      const numNodes = 1000;
      const nodes = Array.from({ length: numNodes }).map((_, i) => ({
        id: String(i),
        data: { label: `Node ${i}` },
        position: { x: 0, y: 0 }
      }));
      
      const edges = [];
      // Create a heavily connected graph
      for (let i = 0; i < numNodes - 1; i++) {
        edges.push({ id: `e${i}`, source: String(i), target: String(i + 1) });
        if (i % 2 === 0 && i + 2 < numNodes) {
          edges.push({ id: `e_skip_${i}`, source: String(i), target: String(i + 2) });
        }
      }

      const startTime = Date.now();
      const layoutedNodes = await performLayout(nodes, edges);
      const endTime = Date.now();

      expect(layoutedNodes.length).toBe(numNodes);
      // It should be reasonably fast, even for 1000 nodes
      expect(endTime - startTime).toBeLessThan(2000); 
    });
  });
});