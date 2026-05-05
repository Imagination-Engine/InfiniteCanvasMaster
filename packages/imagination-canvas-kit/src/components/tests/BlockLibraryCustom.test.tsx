/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BlockLibraryDrawer } from "../BlockLibraryDrawer";
import { blockRegistry } from "@iem/core";

describe("BlockLibraryDrawer Custom Blocks", () => {
  beforeEach(() => {
    // blockRegistry.clear() might not be available or safe if other tests rely on it
    // But for this test, we want to ensure "Custom" category appears
  });

  it("should display a 'Custom' category when custom blocks are present", () => {
    // Register a custom block
    blockRegistry.register({
      id: "custom.block.1",
      name: "My Custom Agent",
      category: "Custom",
      description: "A saved custom agent",
      icon: "User",
      input: {},
      output: {},
      agent: { kind: "local", toolName: "custom", invoke: async () => ({}) },
      mode: "ambient",
      capabilities: [],
      accepts: [],
      produces: [],
      agentic: true,
      runtime: "agent",
    });

    render(<BlockLibraryDrawer />);

    // Open drawer
    fireEvent.click(screen.getByRole("button"));

    // Check for "Custom" category button
    const categoryButtons = screen.getAllByRole("button");
    const customTab = categoryButtons.find((b) => b.textContent === "Custom");
    expect(customTab).toBeDefined();

    // Click custom tab
    fireEvent.click(customTab!);

    // Check if custom block is visible
    expect(screen.getByText(/My Custom Agent/i)).toBeDefined();
  });
});
