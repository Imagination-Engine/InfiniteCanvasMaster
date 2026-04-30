import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TextChunkerView } from './TextChunkerView';

describe('TextChunkerView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<TextChunkerView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('chunker-view')).toBeInTheDocument();
    expect(screen.getByText('TextChunker')).toBeInTheDocument();
  });
});
