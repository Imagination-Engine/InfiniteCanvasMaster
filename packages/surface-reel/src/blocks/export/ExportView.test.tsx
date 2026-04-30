import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExportView } from './ExportView';

describe('ExportView Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<ExportView id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('export-view')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
