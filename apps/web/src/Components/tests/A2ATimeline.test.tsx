import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { A2ATimeline } from "../A2ATimeline";
import * as a2aHooks from "../../hooks/useA2A";

vi.mock("../../hooks/useA2A", () => ({
  useA2AHistory: vi.fn(),
  useA2ASubscription: vi.fn(),
}));

describe("A2ATimeline", () => {
  it("should render empty state correctly", () => {
    (a2aHooks.useA2AHistory as any).mockReturnValue({
      history: [],
      isLoading: false,
    });
    (a2aHooks.useA2ASubscription as any).mockReturnValue({
      lastEnvelope: null,
      isConnected: true,
    });

    render(<A2ATimeline runId="test-run" />);
    expect(screen.getByText(/A2A Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/No events captured/i)).toBeInTheDocument();
  });

  it("should render events correctly", () => {
    const mockEvent = {
      id: "1",
      event: { type: "node.started", timestamp: new Date().toISOString() },
      source: { id: "node-1" },
    };
    (a2aHooks.useA2AHistory as any).mockReturnValue({
      history: [mockEvent],
      isLoading: false,
    });
    (a2aHooks.useA2ASubscription as any).mockReturnValue({
      lastEnvelope: null,
      isConnected: true,
    });

    render(<A2ATimeline runId="test-run" />);
    expect(screen.getByText(/node.started/i)).toBeInTheDocument();
    expect(screen.getByText(/Source: node-1/i)).toBeInTheDocument();
  });

  it("adversarial: should show loading state", () => {
    (a2aHooks.useA2AHistory as any).mockReturnValue({
      history: [],
      isLoading: true,
    });
    (a2aHooks.useA2ASubscription as any).mockReturnValue({
      lastEnvelope: null,
      isConnected: false,
    });

    render(<A2ATimeline runId="test-run" />);
    expect(screen.getByText(/Loading Timeline/i)).toBeInTheDocument();
  });
});
