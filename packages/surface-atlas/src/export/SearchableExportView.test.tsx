import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SearchableExportView from './SearchableExportView';

describe('SearchableExportView (Red/Green Phase)', () => {
  const mockGraphState = {
    nodes: [
      { id: '1', type: 'Ingestion', data: { label: 'Document A', content: 'This is the first document about dogs' } },
      { id: '2', type: 'Ingestion', data: { label: 'Document B', content: 'This is about cats' } }
    ]
  };

  it('renders the search input', () => {
    render(<SearchableExportView graphState={mockGraphState} />);
    expect(screen.getByPlaceholderText('Search your knowledge graph...')).toBeInTheDocument();
  });

  it('filters nodes based on search query', () => {
    render(<SearchableExportView graphState={mockGraphState} />);
    
    // Initially shows all items (or a prompt)
    const input = screen.getByPlaceholderText('Search your knowledge graph...');
    
    fireEvent.change(input, { target: { value: 'dogs' } });
    
    expect(screen.getByText('Document A')).toBeInTheDocument();
    expect(screen.queryByText('Document B')).not.toBeInTheDocument();
  });

  it('adversarial: handles empty graph states gracefully', () => {
    render(<SearchableExportView graphState={{ nodes: [] }} />);
    const input = screen.getByPlaceholderText('Search your knowledge graph...');
    fireEvent.change(input, { target: { value: 'dogs' } });
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});