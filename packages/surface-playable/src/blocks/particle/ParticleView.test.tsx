import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ParticleView } from './ParticleView';

describe('ParticleView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<ParticleView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('particle-view')).toBeInTheDocument();
    expect(screen.getByText('Particle')).toBeInTheDocument();
  });
});
