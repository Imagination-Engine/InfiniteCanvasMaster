import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DocumentLoaderView } from './DocumentLoaderView';

describe('DocumentLoaderView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<DocumentLoaderView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('documentLoader-view')).toBeInTheDocument();
    expect(screen.getByText('DocumentLoader')).toBeInTheDocument();
  });
});
