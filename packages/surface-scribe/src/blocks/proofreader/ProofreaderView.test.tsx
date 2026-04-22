import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProofreaderView } from './ProofreaderView';

describe('ProofreaderView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<ProofreaderView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('proofreader-view')).toBeInTheDocument();
    expect(screen.getByText('Proofreader')).toBeInTheDocument();
  });
});
