import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GraphKnowledgeView } from './GraphKnowledgeView';

describe('GraphKnowledgeView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<GraphKnowledgeView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('graphKnowledge-view')).toBeInTheDocument();
    expect(screen.getByText('GraphKnowledge')).toBeInTheDocument();
  });
});
