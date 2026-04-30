import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VectorSearchView } from './VectorSearchView';

describe('VectorSearchView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<VectorSearchView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('vectorSearch-view')).toBeInTheDocument();
    expect(screen.getByText('VectorSearch')).toBeInTheDocument();
  });
});
