/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";

// Mock stores to avoid persistence and complex logic
vi.mock("../../state/selectionStore", () => {
  const state = {
    selectedIds: [],
    setSelection: vi.fn(),
    setHovered: vi.fn(),
    hoveredId: null,
    clearSelection: vi.fn(),
  };
  return {
    useSelectionStore: vi.fn((selector) =>
      selector ? selector(state) : state,
    ),
  };
});

vi.mock("../../state/expansionStore", () => {
  const state = { setExpanded: vi.fn() };
  return {
    useExpansionStore: vi.fn((selector) =>
      selector ? selector(state) : state,
    ),
  };
});

vi.mock("../../state/viewportStore", () => {
  const state = { x: 0, y: 0, zoom: 1 };
  return {
    useViewportStore: vi.fn((selector) => (selector ? selector(state) : state)),
  };
});

vi.mock("../../state/shellStore", () => {
  const state = { canvasId: "test-canvas" };
  return {
    useShellStore: vi.fn((selector) => (selector ? selector(state) : state)),
  };
});

vi.mock("../../state/canvasStore", () => ({
  useCanvasStore: (selector: any) => {
    const state = {
      objects: {},
      updateObject: vi.fn(),
      removeObject: vi.fn(),
      patchObjectMetadata: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("../../state/connectionStore", () => ({
  useConnectionStore: () => ({
    addConnection: vi.fn(),
  }),
}));

vi.mock("../../hooks/useCanvasHistory", () => ({
  useCanvasHistory: () => ({
    capture: vi.fn(),
  }),
}));

describe("Connection Handles Visibility", () => {
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
      role: "Researcher",
    },
    blockKind: "agent",
  };

  afterEach(() => {
    cleanup();
  });

  it("should render visible connection handles on both left and right sides even when not hovered", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    const leftHandle = screen.getByTitle(/Input — connect upstream/i);
    const rightHandle = screen.getByTitle(/Output — drag to connect/i);

    expect(leftHandle).toBeDefined();
    expect(rightHandle).toBeDefined();

    // Check visibility classes - should NOT have opacity-0
    expect(leftHandle.className).not.toContain("opacity-0");
    expect(rightHandle.className).not.toContain("opacity-0");

    // Should have some visible opacity (80 or 100)
    const hasVisibleOpacity = (className: string) =>
      className.includes("opacity-80") || className.includes("opacity-100");

    expect(hasVisibleOpacity(leftHandle.className)).toBe(true);
    expect(hasVisibleOpacity(rightHandle.className)).toBe(true);

    // Check shape
    const leftInnerCircle = leftHandle.firstChild as HTMLElement;
    const rightInnerCircle = rightHandle.firstChild as HTMLElement;

    expect(leftInnerCircle.className).toContain("rounded-full");
    expect(rightInnerCircle.className).toContain("rounded-full");
  });
});
