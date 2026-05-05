/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";
import { useSelectionStore } from "../../state/selectionStore";
import { useCanvasStore } from "../../state/canvasStore";

describe("ObjectRenderer Top Bar", () => {
  const mockObject = {
    id: "obj-1",
    type: "iem.agent.agent",
    x: 0,
    y: 0,
    width: 320,
    height: 240,
    zIndex: 1,
    status: "idle",
    metadata: {
      label: "Test Agent",
    },
  };

  beforeEach(() => {
    useSelectionStore.setState({ selectedIds: [] });
    useCanvasStore.setState({ objects: { [mockObject.id]: mockObject } });
  });

  afterEach(() => {
    cleanup();
  });

  it("should not contain gear or minimize icons", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    // Settings icon is the gear
    const settingsButton = screen.queryByTitle(/Settings Inspector/i);
    expect(settingsButton).toBeNull();

    // Minus icon is the minimize
    const minimizeButton = screen.queryByTitle(/Minimize/i);
    expect(minimizeButton).toBeNull();
  });

  it("should contain exactly one maximize icon", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    const maximizeButtons = screen.getAllByTitle(/Immersive View/i);
    expect(maximizeButtons.length).toBe(1);
  });
});
