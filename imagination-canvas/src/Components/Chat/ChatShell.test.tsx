import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatShell } from './ChatShell';

import { useChat } from 'ai';
import { useSessionStore } from '../../store/useSessionStore';

// Attempting to mock at a higher level
vi.mock('ai', () => {
  return {
    useChat: vi.fn(() => ({
      messages: [
        { id: '1', role: 'user', content: 'hello' },
        { id: '2', role: 'assistant', content: '**Hello**! I am *ready*.' }
      ],
      input: '',
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn((e) => e.preventDefault()),
    }))
  };
});

describe('ChatShell Component', () => {
  it('renders messages with markdown', () => {
    render(<ChatShell />);
    
    // Check for bold and italic text (rendered as strong and em by react-markdown)
    const strong = screen.getByText('Hello');
    expect(strong.tagName).toBe('STRONG');
    
    const em = screen.getByText('ready');
    expect(em.tagName).toBe('EM');
  });

  it('handles input submission', () => {
    const mockHandleSubmit = vi.fn((e) => e.preventDefault());
    const mockHandleInputChange = vi.fn();
    
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'test message',
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
    } as any);

    render(<ChatShell />);
    
    const input = screen.getByPlaceholderText(/Type your thoughts.../i);
    const form = screen.getByRole('form');
    
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('renders error message when present', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: '',
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      error: new Error('Network failure')
    } as any);

    render(<ChatShell />);
    expect(screen.getByText(/Error: Network failure/i)).toBeInTheDocument();
  });

  it('handles rapid view toggling', () => {
    const mockToggle = vi.fn();
    
    useSessionStore.setState({ hasCanvas: true, toggleCanvas: mockToggle });
    
    render(<ChatShell />);
    const button = screen.getByText(/Open\?/i);
    
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(mockToggle).toHaveBeenCalledTimes(3);
  });
});


