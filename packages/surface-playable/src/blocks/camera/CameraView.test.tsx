import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CameraView } from './CameraView';

describe('CameraView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<CameraView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    expect(screen.getByText('Camera')).toBeInTheDocument();
  });
});
