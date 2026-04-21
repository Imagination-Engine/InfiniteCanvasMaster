import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimelineUI from './TimelineUI';

describe('Timeline UI Component', () => {
  it('renders a track area', () => {
    render(<TimelineUI scenes={[]} />);
    expect(screen.getByTestId('timeline-track')).toBeInTheDocument();
  });

  it('synchronizes and renders scenes from canvas state', () => {
    const mockScenes = [
      { id: '1', startTimeMs: 0, durationMs: 3000, name: 'Scene 1' },
      { id: '2', startTimeMs: 3000, durationMs: 2000, name: 'Scene 2' }
    ];
    render(<TimelineUI scenes={mockScenes} />);
    expect(screen.getByText('Scene 1')).toBeInTheDocument();
    expect(screen.getByText('Scene 2')).toBeInTheDocument();
  });

  it('renders an optimized thumbnail placeholder', () => {
    const mockScenes = [
      { id: '1', startTimeMs: 0, durationMs: 3000, name: 'Scene 1', thumbnailUrl: 'http://mock.com/thumb.png' },
    ];
    render(<TimelineUI scenes={mockScenes} />);
    const img = screen.getByRole('img', { name: /thumbnail for scene 1/i });
    expect(img).toHaveAttribute('src', 'http://mock.com/thumb.png');
    expect(img).toHaveStyle({ objectFit: 'cover' }); // Optimized rendering logic
  });
});