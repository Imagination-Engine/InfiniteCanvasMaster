import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DialogueTreeView } from './DialogueTreeView';

describe('DialogueTreeView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<DialogueTreeView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('dialogueTree-view')).toBeInTheDocument();
    expect(screen.getByText('DialogueTree')).toBeInTheDocument();
  });
});
