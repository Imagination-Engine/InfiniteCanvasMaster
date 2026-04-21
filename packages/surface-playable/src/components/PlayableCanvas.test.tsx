import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayableCanvas from './PlayableCanvas';

describe('PlayableCanvas', () => {
  it('renders standard canvas view initially', () => {
    render(<PlayableCanvas />);
    expect(screen.getByText('Standard Canvas Mode')).toBeInTheDocument();
  });

  it('toggles to playable view when button is clicked', () => {
    render(<PlayableCanvas />);
    const toggleButton = screen.getByRole('button', { name: /Toggle Mode/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText('Playable Engine Mode')).toBeInTheDocument();
  });

  it('toggles back to standard view', () => {
    render(<PlayableCanvas />);
    const toggleButton = screen.getByRole('button', { name: /Toggle Mode/i });
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    expect(screen.getByText('Standard Canvas Mode')).toBeInTheDocument();
  });
});