import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CharacterProfileView } from './CharacterProfileView';

describe('CharacterProfileView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<CharacterProfileView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('characterProfile-view')).toBeInTheDocument();
    expect(screen.getByText('CharacterProfile')).toBeInTheDocument();
  });
});
