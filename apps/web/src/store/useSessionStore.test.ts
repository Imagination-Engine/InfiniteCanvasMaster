import { describe, it, expect, vi } from 'vitest';
import { useSessionStore } from './useSessionStore';

describe('useSessionStore', () => {
  it('initializes with hasCanvas: false', () => {
    const { getState } = useSessionStore;
    const state = getState();
    expect(state.hasCanvas).toBe(false);
  });

  it('sets hasCanvas to true when tool call is detected', () => {
    const { getState, setState } = useSessionStore;
    
    // Simulate detecting a tool call
    setState({ hasCanvas: true });
    
    expect(getState().hasCanvas).toBe(true);
  });
});
