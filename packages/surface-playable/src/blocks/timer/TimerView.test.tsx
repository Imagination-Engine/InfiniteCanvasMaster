import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TimerView } from './TimerView';

describe('TimerView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<TimerView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('timer-view')).toBeInTheDocument();
    expect(screen.getByText('Timer')).toBeInTheDocument();
  });
});
