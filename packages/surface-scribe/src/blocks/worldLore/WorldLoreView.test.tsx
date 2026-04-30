import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorldLoreView } from './WorldLoreView';

describe('WorldLoreView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<WorldLoreView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('worldLore-view')).toBeInTheDocument();
    expect(screen.getByText('WorldLore')).toBeInTheDocument();
  });
});
