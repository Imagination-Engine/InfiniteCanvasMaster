import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProseView } from './ProseView';

describe('ProseView Component', () => {
  it('renders correctly with given content in Tiptap editor', () => {
    render(<ProseView data={{ content: '<p>Custom Text</p>' }} />);
    expect(screen.getByTestId('prose-view')).toBeInTheDocument();
    // Tiptap renders the content inside a contenteditable div
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });
});
