import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreView } from './ScoreView';

describe('ScoreView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<ScoreView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('score-view')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });
});
