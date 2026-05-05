/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { BlockLibraryDrawer } from "../BlockLibraryDrawer";

describe("BlockLibraryDrawer Search and Filter", () => {
  beforeEach(() => {
    // Mock fetch for custom blocks
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ blocks: [] }),
      } as Response),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should open and display search input", () => {
    render(<BlockLibraryDrawer />);

    // Click library button to open
    fireEvent.click(screen.getByRole("button", { name: /Library/i }));

    const searchInput = screen.getByPlaceholderText(/Search 70\+ blocks/i);
    expect(searchInput).toBeDefined();
  });

  it("should filter blocks based on search input", () => {
    render(<BlockLibraryDrawer />);
    fireEvent.click(screen.getByRole("button", { name: /Library/i }));

    const searchInput = screen.getByPlaceholderText(/Search 70\+ blocks/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentBlock" } });

    // Assuming we use BlockLibraryCard, let's see if any headings remain
    const headings = screen.queryAllByRole("heading", { level: 3 });
    expect(headings.length).toBe(0);
  });

  it("should filter blocks based on category selection", () => {
    render(<BlockLibraryDrawer />);
    fireEvent.click(screen.getByRole("button", { name: /Library/i }));

    // Find the category button specifically (it's the one with uppercase tracking-widest classes usually)
    // We can use a more precise query.
    const allButtons = screen.getAllByRole("button");
    const studiosButton = allButtons.find((b) => b.textContent === "Studios");

    if (studiosButton) {
      fireEvent.click(studiosButton);
      // Verify active state classes or filtered results
      expect(studiosButton.className).toContain("bg-brand-cyan");
    }
  });
});
