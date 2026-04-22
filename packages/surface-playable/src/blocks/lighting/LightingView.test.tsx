import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LightingView } from './LightingView';

describe('LightingView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<LightingView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('lighting-view')).toBeInTheDocument();
    expect(screen.getByText('Lighting')).toBeInTheDocument();
  });
});
