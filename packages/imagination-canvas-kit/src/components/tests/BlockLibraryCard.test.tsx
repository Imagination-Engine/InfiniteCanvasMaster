/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import { BlockLibraryCard } from "../BlockLibraryCard";

describe("BlockLibraryCard", () => {
  afterEach(() => {
    cleanup();
  });

  const mockBlock = {
    id: "test-block",
    name: "Test Block",
    description:
      "This is a descriptive text for the component. It covers two sentences.",
    category: "Test Category",
    icon: "Box",
    capabilities: ["capability-1", "capability-2"],
    runtime: "live",
  };

  it("should render block name in a heading", () => {
    render(<BlockLibraryCard block={mockBlock as any} />);
    expect(screen.getByRole("heading", { name: /Test Block/i })).toBeDefined();
  });

  it("should render the block description", () => {
    render(<BlockLibraryCard block={mockBlock as any} />);
    expect(screen.getByText(/This is a descriptive text/i)).toBeDefined();
  });

  it("should render capability chips", () => {
    render(<BlockLibraryCard block={mockBlock as any} />);
    expect(screen.getByText(/capability-1/i)).toBeDefined();
    expect(screen.getByText(/capability-2/i)).toBeDefined();
  });

  it("should render runtime status", () => {
    render(<BlockLibraryCard block={mockBlock as any} />);
    expect(screen.getByText(/live/i)).toBeDefined();
  });

  it("should set dataTransfer on drag start", () => {
    render(<BlockLibraryCard block={mockBlock as any} />);
    const card = screen
      .getByRole("heading", { name: /Test Block/i })
      .closest('div[draggable="true"]');

    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: "",
    };

    fireEvent.dragStart(card!, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith(
      "application/reactflow",
      "test-block",
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      "text/plain",
      "test-block",
    );
  });

  // ─── Issue 1: Block Library Cards UI Upgrade (Red & Adversarial) ────────

  it("should render the runtime badge with color-coded class for 'agent' runtime", () => {
    render(
      <BlockLibraryCard block={{ ...mockBlock, runtime: "agent" } as any} />,
    );
    // Will FAIL before implementation — no runtime-badge test id or purple class yet
    const badge = screen.getByTestId("runtime-badge");
    expect(badge.className).toMatch(/brand-purple/);
  });

  it("should render I/O row with accepts and produces when block has those fields", () => {
    const block = { ...mockBlock, accepts: ["text"], produces: ["prose"] };
    render(<BlockLibraryCard block={block as any} />);
    // Will FAIL — I/O row does not exist yet
    expect(screen.getByTestId("io-row")).toBeDefined();
    expect(screen.getByText("text")).toBeDefined();
    expect(screen.getByText("prose")).toBeDefined();
  });

  it("should not render I/O row when accepts/produces are absent", () => {
    render(<BlockLibraryCard block={mockBlock as any} />);
    expect(screen.queryByTestId("io-row")).toBeNull();
  });

  it("adversarial: renders gracefully when runtime is an unknown value", () => {
    render(
      <BlockLibraryCard
        block={{ ...mockBlock, runtime: "unknown-runtime-xyz" } as any}
      />,
    );
    // Must not crash, must fall back to muted style (no specific color class)
    const badge = screen.getByTestId("runtime-badge");
    expect(badge).toBeDefined();
  });

  it("adversarial: caps capability chips at 3 even if block has 10+", () => {
    const block = {
      ...mockBlock,
      capabilities: Array.from({ length: 10 }, (_, i) => `cap-${i}`),
    };
    render(<BlockLibraryCard block={block as any} />);
    // Wait, the current code already has `.slice(0, 3)` for capabilities!
    // So this test should actually PASS immediately.
    const allChips = screen.getAllByText(/cap-/);
    expect(allChips.length).toBe(3);
  });
});
