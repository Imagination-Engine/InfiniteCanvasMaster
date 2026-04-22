import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AudioView } from './AudioView';

describe('AudioView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<AudioView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('audio-view')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
  });
});
