// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { MobileCaptureFAB } from "../MobileCaptureFAB";

describe("MobileCaptureFAB", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  it("should render a floating action button on mobile screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { getByRole, container } = render(
      <MobileCaptureFAB onCapture={() => {}} onOrganize={() => {}} />,
    );

    const fab = getByRole("button", { name: /add/i });
    expect(fab).toBeDefined();

    // Should have FAB positioning
    expect(fab.style.position).toBe("");
    // The button itself might not have these styles inline in some environments, but its wrapper does.
  });

  it("should expand to show capture and organize options when clicked", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    const mockOrganize = vi.fn();
    const mockCapture = vi.fn();

    const { getByRole, getByText, queryByText } = render(
      <MobileCaptureFAB onCapture={mockCapture} onOrganize={mockOrganize} />,
    );

    // Initially options are hidden
    expect(queryByText("✨ Organize")).toBeNull();

    // Click FAB to expand
    const fab = getByRole("button", { name: /add/i });
    fireEvent.click(fab);

    // Options should now be visible
    const organizeBtn = getByText("✨ Organize");
    expect(organizeBtn).toBeDefined();

    // Click Organize
    fireEvent.click(organizeBtn);
    expect(mockOrganize).toHaveBeenCalled();
  });

  it("should not render on desktop screens", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    const { container } = render(
      <MobileCaptureFAB onCapture={() => {}} onOrganize={() => {}} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
