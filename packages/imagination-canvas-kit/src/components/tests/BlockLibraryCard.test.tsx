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
});
