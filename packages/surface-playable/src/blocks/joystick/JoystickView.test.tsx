import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JoystickView } from './JoystickView';

describe('JoystickView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<JoystickView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('joystick-view')).toBeInTheDocument();
    expect(screen.getByText('Joystick')).toBeInTheDocument();
  });
});
