import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpawnerView } from './SpawnerView';

describe('SpawnerView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<SpawnerView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('spawner-view')).toBeInTheDocument();
    expect(screen.getByText('Spawner')).toBeInTheDocument();
  });
});
