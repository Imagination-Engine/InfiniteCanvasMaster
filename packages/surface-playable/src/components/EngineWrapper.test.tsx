import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EngineWrapper from './EngineWrapper';
import { Game } from 'phaser';

// Mock Phaser Game to prevent canvas rendering errors in JSDOM
vi.mock('phaser', () => {
  return {
    Game: vi.fn(function() {
      return {
        destroy: vi.fn(),
      };
    }),
    AUTO: 0,
    Scale: {
      FIT: 0,
      CENTER_BOTH: 0,
    },
    Scene: class Scene {}
  };
});

vi.mock('@esotericsoftware/spine-phaser', () => ({
  SpinePlugin: class SpinePlugin {}
}));

describe('EngineWrapper', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('mounts the phaser container element', () => {
    render(<EngineWrapper />);
    const container = screen.getByTestId('phaser-container');
    expect(container).toBeInTheDocument();
  });

  it('initializes the Phaser game instance on mount with matter physics and spine plugin', () => {
    render(<EngineWrapper />);
    expect(Game).toHaveBeenCalledTimes(1);
    const config = (Game as any).mock.calls[0][0];
    expect(config.physics.default).toBe('matter');
    expect(config.plugins.scene).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'SpinePlugin' })
      ])
    );
  });

  it('destroys the Phaser game instance on unmount to prevent WebGL leaks', () => {
    const { unmount } = render(<EngineWrapper />);
    const gameInstance = (Game as any).mock.results[0].value;
    unmount();
    expect(gameInstance.destroy).toHaveBeenCalledWith(true);
  });

  it('adversarial: handles aggressive mounting and unmounting without leaking multiple instances', () => {
    const mockGame = Game as any;
    const initialCallCount = mockGame.mock.calls.length;
    
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<EngineWrapper />);
      const gameInstance = mockGame.mock.results[mockGame.mock.results.length - 1].value;
      unmount();
      expect(gameInstance.destroy).toHaveBeenCalledWith(true);
    }
    
    expect(mockGame).toHaveBeenCalledTimes(initialCallCount + 5);
  });
});