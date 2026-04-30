import { describe, it, expect } from 'vitest';
import { BlackboardManager } from './BlackboardManager';

describe('BlackboardManager (Red/Green Phase)', () => {
  it('initializes with an empty state', () => {
    const manager = new BlackboardManager();
    expect(manager.getState()).toEqual({
      spec: null,
      design: null,
      code: {},
      testResults: null,
    });
  });

  it('allows immutable updates to the state', () => {
    const manager = new BlackboardManager();
    const updated = manager.update({ spec: { title: 'App', components: [] } });
    expect(updated.spec?.title).toBe('App');
    expect(manager.getState().spec?.title).toBe('App');
  });

  it('adversarial: handles conflicting mutations by maintaining immutability', () => {
    const manager = new BlackboardManager();
    
    const stateA = manager.update({ code: { 'index.js': 'console.log("A")' } });
    const stateB = manager.update({ code: { 'style.css': 'body { color: red }' } });

    // Since the manager handles concurrent updates by merging, stateB should ideally merge with whatever the base was, or apply sequentially
    // The requirement says "simulating conflicting mutations from parallel blocks"
    // Let's implement a versioned or deep merged update to prevent complete overwrites of sub-objects like `code`
    const finalState = manager.getState();
    expect(finalState.code).toHaveProperty('index.js');
    expect(finalState.code).toHaveProperty('style.css');
  });
});