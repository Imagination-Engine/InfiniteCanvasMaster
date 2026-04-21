import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MainLayout } from './MainLayout';
import { useViewStore } from '../../store/useViewStore';

// Mock the components that will be rendered inside the layout
vi.mock('../Chat/ChatShell', () => ({
  ChatShell: () => <div data-testid="chat-shell">Chat Shell</div>
}));

vi.mock('../Canvas', () => ({
  default: () => <div data-testid="canvas-view">Canvas View</div>
}));

describe('MainLayout', () => {
  it('should render only ChatShell when viewMode is "chat"', () => {
    useViewStore.setState({ viewMode: 'chat' });
    render(<MainLayout canvasComponent={<div>Canvas</div>} />);
    expect(screen.getByTestId('chat-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas-view')).not.toBeInTheDocument();
  });

  it('should render only Canvas when viewMode is "canvas"', () => {
    useViewStore.setState({ viewMode: 'canvas' });
    render(<MainLayout canvasComponent={<div data-testid="canvas-view">Canvas</div>} />);
    expect(screen.queryByTestId('chat-shell')).not.toBeInTheDocument();
    expect(screen.getByTestId('canvas-view')).toBeInTheDocument();
  });

  it('should render both when viewMode is "dual"', () => {
    useViewStore.setState({ viewMode: 'dual' });
    render(<MainLayout canvasComponent={<div data-testid="canvas-view">Canvas</div>} />);
    expect(screen.getByTestId('chat-shell')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-view')).toBeInTheDocument();
  });

  it('should have flex-col class on mobile/small viewports', () => {
    useViewStore.setState({ viewMode: 'dual' });
    const { container } = render(<MainLayout canvasComponent={<div>Canvas</div>} />);
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('md:flex-row');
  });
});
