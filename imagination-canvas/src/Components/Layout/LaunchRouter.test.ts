import { describe, it, expect } from 'vitest';
import { getRouteForSurface } from './LaunchRouter';

describe('LaunchRouter Logic', () => {
  it('returns /playable/:id for playable surface', () => {
    expect(getRouteForSurface('playable', '123')).toBe('/playable/123');
  });

  it('returns /conductor/:id for conductor surface', () => {
    expect(getRouteForSurface('conductor', '456')).toBe('/conductor/456');
  });

  it('returns /reel/:id for reel surface', () => {
    expect(getRouteForSurface('reel', '789')).toBe('/reel/789');
  });

  it('returns /forge/:id for forge surface', () => {
    expect(getRouteForSurface('forge', 'abc')).toBe('/forge/abc');
  });

  it('returns /chat/:id as fallback for unknown surface', () => {
    // @ts-ignore
    expect(getRouteForSurface('unknown', 'xyz')).toBe('/chat/xyz');
  });
});
