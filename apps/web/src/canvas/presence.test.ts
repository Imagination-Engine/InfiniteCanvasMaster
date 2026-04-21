import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresence } from './presence';

// Mock Liveblocks config
vi.mock('./liveblocks.config', () => ({
  useMyPresence: vi.fn(() => ({ cursor: null, selection: [] })),
  useUpdateMyPresence: vi.fn(() => vi.fn()),
  useOthers: vi.fn(() => []),
}));

import { useMyPresence, useUpdateMyPresence } from './liveblocks.config';

describe('usePresence Hook with Liveblocks', () => {
  it('calls useMyPresence to get state', () => {
    const mockPresence = { cursor: { x: 1, y: 2 }, selection: ['node-1'] };
    vi.mocked(useMyPresence).mockReturnValue(mockPresence);
    
    const { result } = renderHook(() => usePresence());
    expect(result.current.myPresence).toEqual(mockPresence);
  });

  it('handles malformed presence updates gracefully', () => {
    const mockUpdate = vi.fn();
    vi.mocked(useUpdateMyPresence).mockReturnValue(mockUpdate);
    
    const { result } = renderHook(() => usePresence());
    
    act(() => {
      // @ts-ignore - testing runtime robustness against bad types
      result.current.updatePresence({ cursor: "not-an-object" });
    });
    
    expect(mockUpdate).toHaveBeenCalledWith({ cursor: "not-an-object" });
  });

  it('handles multiple rapid updates', () => {
    const mockUpdate = vi.fn();
    vi.mocked(useUpdateMyPresence).mockReturnValue(mockUpdate);
    
    const { result } = renderHook(() => usePresence());
    
    act(() => {
      result.current.updatePresence({ cursor: { x: 1, y: 1 } });
      result.current.updatePresence({ cursor: { x: 2, y: 2 } });
      result.current.updatePresence({ cursor: { x: 3, y: 3 } });
    });
    
    // In a real Liveblocks integration, useUpdateMyPresence's return function 
    // might have its own internal throttling, but here we check it's called.
    expect(mockUpdate).toHaveBeenCalledTimes(3);
  });
});


