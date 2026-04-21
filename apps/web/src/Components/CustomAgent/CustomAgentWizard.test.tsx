import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// @ts-ignore - Component does not exist yet
import CustomAgentWizard from './CustomAgentWizard';

describe('CustomAgentWizard', () => {
  it('should render the first step (Story) initially', () => {
    render(<CustomAgentWizard onClose={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText(/Step 1: Story/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /story/i })).toBeInTheDocument();
  });

  it('should prevent proceeding to step 2 if story is empty', async () => {
    render(<CustomAgentWizard onClose={vi.fn()} onComplete={vi.fn()} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/story is required/i)).toBeInTheDocument();
    });
    
    // Still on step 1
    expect(screen.getByText(/Step 1: Story/i)).toBeInTheDocument();
  });

  it('should proceed to step 2 if story is valid', async () => {
    render(<CustomAgentWizard onClose={vi.fn()} onComplete={vi.fn()} />);
    
    const storyInput = screen.getByRole('textbox', { name: /story/i });
    fireEvent.change(storyInput, { target: { value: 'This is a test story.' } });
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Persona/i)).toBeInTheDocument();
    });
  });

  it('should reject massive payload sizes (adversarial)', async () => {
    render(<CustomAgentWizard onClose={vi.fn()} onComplete={vi.fn()} />);
    
    const storyInput = screen.getByRole('textbox', { name: /story/i });
    const massiveText = 'a'.repeat(20000); // 20k characters
    
    fireEvent.change(storyInput, { target: { value: massiveText } });
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/story must be less than 10000 characters/i)).toBeInTheDocument();
    });
  });
});
