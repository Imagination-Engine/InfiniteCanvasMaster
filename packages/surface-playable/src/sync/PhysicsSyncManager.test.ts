import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Y from 'yjs';
import { PhysicsSyncManager } from './PhysicsSyncManager';

describe('PhysicsSyncManager', () => {
  let doc: Y.Doc;
  let manager: PhysicsSyncManager;

  beforeEach(() => {
    doc = new Y.Doc();
    manager = new PhysicsSyncManager(doc, 'game_state');
  });

  it('updates local state and broadcasts via yjs', () => {
    manager.updateEntity('player1', { x: 10, y: 20, vx: 1, vy: 0 });
    
    const state = doc.getMap('game_state').get('player1') as any;
    expect(state).toBeDefined();
    expect(state.x).toBe(10);
  });

  it('verifies identical physics state across two simulated clients', () => {
    const doc2 = new Y.Doc();
    const manager2 = new PhysicsSyncManager(doc2, 'game_state');

    // Simulate connection between doc and doc2
    doc.on('update', (update) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update) => {
      Y.applyUpdate(doc, update);
    });

    manager.updateEntity('player1', { x: 100, y: 200, vx: 5, vy: 5 });
    
    const state2 = manager2.getEntity('player1');
    expect(state2).toEqual({ x: 100, y: 200, vx: 5, vy: 5 });
  });

  it('adversarial: handles rapid jitter and out-of-order updates', () => {
    const doc2 = new Y.Doc();
    const manager2 = new PhysicsSyncManager(doc2, 'game_state');

    const updates: Uint8Array[] = [];
    doc.on('update', (update) => {
      updates.push(update);
    });

    manager.updateEntity('player1', { x: 10, y: 10, vx: 0, vy: 0 });
    manager.updateEntity('player1', { x: 15, y: 15, vx: 1, vy: 1 });
    manager.updateEntity('player1', { x: 20, y: 20, vx: 2, vy: 2 });

    // Apply updates out of order or with jitter
    Y.applyUpdate(doc2, updates[2]);
    Y.applyUpdate(doc2, updates[0]);
    Y.applyUpdate(doc2, updates[1]);

    const state2 = manager2.getEntity('player1');
    // Yjs naturally handles causality, but we ensure the end state reflects the deterministic CRDT merge
    expect(state2).toBeDefined();
    // It should eventually converge to { x: 20, y: 20, vx: 2, vy: 2 } or at least be valid
    // Since Yjs updates contain state vectors, applying them out of order will still converge
    expect(state2.x).toBe(20);
  });
});