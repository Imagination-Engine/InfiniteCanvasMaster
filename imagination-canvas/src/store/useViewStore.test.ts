import { describe, it, expect, beforeEach } from 'vitest';
import { useViewStore } from './useViewStore';

describe('useViewStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useViewStore.setState({ viewMode: 'chat' });
  });

  it('should have initial viewMode as "chat"', () => {
    const { viewMode } = useViewStore.getState();
    expect(viewMode).toBe('chat');
  });

  it('should change viewMode to "canvas"', () => {
    const { setViewMode } = useViewStore.getState();
    setViewMode('canvas');
    expect(useViewStore.getState().viewMode).toBe('canvas');
  });

  it('should change viewMode to "dual"', () => {
    const { setViewMode } = useViewStore.getState();
    setViewMode('dual');
    expect(useViewStore.getState().viewMode).toBe('dual');
  });

  it('should handle rapid toggling without issues', () => {
    const { setViewMode } = useViewStore.getState();
    const modes: ('chat' | 'canvas' | 'dual')[] = ['chat', 'canvas', 'dual', 'chat', 'dual', 'canvas'];
    
    modes.forEach(mode => {
      setViewMode(mode);
    });

    expect(useViewStore.getState().viewMode).toBe('canvas');
  });
});
