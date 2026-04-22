import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IndexerView } from './IndexerView';

describe('IndexerView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<IndexerView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('indexer-view')).toBeInTheDocument();
    expect(screen.getByText('Indexer')).toBeInTheDocument();
  });
});
