import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavigationSidebar } from './NavigationSidebar';

describe('NavigationSidebar', () => {
  it('renders the New Chat button', () => {
    render(<NavigationSidebar />);
    expect(screen.getByText(/New Chat/i)).toBeInTheDocument();
  });

  it('renders History section title', () => {
    render(<NavigationSidebar />);
    expect(screen.getByText(/History/i)).toBeInTheDocument();
  });

  it('toggles between list and grid view', () => {
    render(<NavigationSidebar />);
    const toggleButton = screen.getByTestId('view-toggle');
    
    // Default should be list view (assuming state starts there)
    // We'll check for a data attribute or class
    expect(screen.getByTestId('history-container')).toHaveAttribute('data-view', 'list');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('history-container')).toHaveAttribute('data-view', 'grid');
  });

  it('renders Creations section', () => {
    render(<NavigationSidebar />);
    expect(screen.getByText(/Creations/i)).toBeInTheDocument();
  });

  it('renders Settings section', () => {
    render(<NavigationSidebar />);
    expect(screen.getByText(/Zachary S/i)).toBeInTheDocument();
  });

  it('renders empty state when no history items', () => {
    render(<NavigationSidebar items={[]} />);
    expect(screen.getByText(/No recent sessions/i)).toBeInTheDocument();
  });

  it('renders correctly with 50+ items', () => {
    const manyItems = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      title: `Session ${i}`,
      updatedAt: '2026-04-20',
      hasCanvas: i % 2 === 0
    }));
    render(<NavigationSidebar items={manyItems} />);
    // Just verify the first and last are rendered
    expect(screen.getByText('Session 0')).toBeInTheDocument();
    expect(screen.getByText('Session 49')).toBeInTheDocument();
  });

  it('filters history items based on search input', () => {
    const items = [
      { id: '1', title: 'Apple', updatedAt: '2026-04-20', hasCanvas: false },
      { id: '2', title: 'Banana', updatedAt: '2026-04-20', hasCanvas: false },
    ];
    render(<NavigationSidebar items={items} />);
    
    // Open search if hidden or just find the input
    const searchButton = screen.getByTestId('search-toggle');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByPlaceholderText(/Search history/i);
    fireEvent.change(searchInput, { target: { value: 'App' } });
    
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });
});



