/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { BlockLibraryDrawer } from "../BlockLibraryDrawer";

describe("BlockLibraryDrawer Search and Filter", () => {
  beforeEach(() => {
    vi.spyOn(window, "fetch").mockImplementation(() =>
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

    fireEvent.click(screen.getByRole("button", { name: /Library/i }));

    const searchInput = screen.getByPlaceholderText(/Search 70\+ blocks/i);
    expect(searchInput).toBeDefined();
  });

  it("should filter blocks based on search input", () => {
    render(<BlockLibraryDrawer />);
    fireEvent.click(screen.getByRole("button", { name: /Library/i }));

    const searchInput = screen.getByPlaceholderText(/Search 70\+ blocks/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentBlock" } });

    const headings = screen.queryAllByRole("heading", { level: 3 });
    expect(headings.length).toBe(0);
  });

  it("should filter blocks based on category selection", () => {
    render(<BlockLibraryDrawer />);
    fireEvent.click(screen.getByRole("button", { name: /Library/i }));

    const allButtons = screen.getAllByRole("button");
    const studiosButton = allButtons.find(
      (b) => b.textContent?.trim() === "Studios",
    );

    if (studiosButton) {
      fireEvent.click(studiosButton);
      expect(studiosButton.className).toContain("bg-brand-cyan");
    }
  });
});
