import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ColliderView } from './ColliderView';

describe('ColliderView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<ColliderView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('collider-view')).toBeInTheDocument();
    expect(screen.getByText('Collider')).toBeInTheDocument();
  });
});
