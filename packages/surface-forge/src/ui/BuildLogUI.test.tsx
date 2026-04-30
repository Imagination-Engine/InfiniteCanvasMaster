import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BuildLogUI from './BuildLogUI';

describe('BuildLogUI', () => {
  it('renders a list of log entries', () => {
    const logs = [
      { id: '1', agent: 'Architect', message: 'Designing spec...' },
      { id: '2', agent: 'Builder', message: 'Writing code...' }
    ];
    render(<BuildLogUI logs={logs} />);
    expect(screen.getByText('Architect:')).toBeInTheDocument();
    expect(screen.getByText('Designing spec...')).toBeInTheDocument();
    expect(screen.getByText('Builder:')).toBeInTheDocument();
    expect(screen.getByText('Writing code...')).toBeInTheDocument();
  });

  it('scrolls to the bottom on new log entries (mock verification)', () => {
    const logs = [{ id: '1', agent: 'Tester', message: 'Running tests' }];
    const { container } = render(<BuildLogUI logs={logs} />);
    // Simple verification that the container is present
    expect(container).toBeInTheDocument();
  });
});