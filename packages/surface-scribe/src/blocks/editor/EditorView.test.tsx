import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EditorView } from './EditorView';

describe('EditorView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<EditorView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('editor-view')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });
});
