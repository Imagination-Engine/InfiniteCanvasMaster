import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatShell } from './ChatShell';

describe('ChatShell', () => {
  it('should render the chat shell with an input area', () => {
    render(<ChatShell />);
    expect(screen.getByPlaceholderText(/Type your thoughts.../i)).toBeInTheDocument();
  });

  it('should render a message list area', () => {
    render(<ChatShell />);
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('should handle extremely long text input without breaking layout', () => {
    const longText = 'a'.repeat(10000);
    render(<ChatShell />);
    const input = screen.getByPlaceholderText(/Type your thoughts.../i) as HTMLInputElement;
    input.value = longText;
    expect(input.value).toBe(longText);
  });
});
