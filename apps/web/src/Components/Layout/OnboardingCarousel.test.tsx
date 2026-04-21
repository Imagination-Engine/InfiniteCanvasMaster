import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingCarousel } from './OnboardingCarousel';
import { useUserStore } from '../../store/useUserStore';

vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [vi.fn(), {
    selectedScrollSnap: vi.fn(() => 0),
    scrollNext: vi.fn(),
    on: vi.fn(),
  }]),
}));

vi.mock('../../store/useUserStore', () => ({
  useUserStore: Object.assign(
    (fn: any) => fn({ setHasCompletedOnboarding: vi.fn() }),
    {
      getState: vi.fn(() => ({ hasCompletedOnboarding: false })),
      setState: vi.fn(),
      subscribe: vi.fn(),
    }
  )
}));

describe('OnboardingCarousel', () => {
  it('renders the first slide initially', () => {
    render(<OnboardingCarousel />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });

  it('navigates through slides', () => {
    render(<OnboardingCarousel />);
    const nextButton = screen.getByText(/Next/i);
    
    fireEvent.click(nextButton);
    expect(screen.getByText(/Blocks are Agents/i)).toBeInTheDocument();
  });
});
