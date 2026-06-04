/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";

// Mock stores
vi.mock("../../state/selectionStore", () => {
  const state = {
    selectedIds: [],
    setSelection: vi.fn(),
    setHovered: vi.fn(),
    hoveredId: "some-other-id", // Test with other block hovered
    clearSelection: vi.fn(),
  };
  return {
    useSelectionStore: vi.fn((selector) =>
      selector ? selector(state) : state,
    ),
  };
});

vi.mock("../../state/expansionStore", () => ({
  useExpansionStore: () => ({
    setExpanded: vi.fn(),
  }),
}));

vi.mock("../../state/viewportStore", () => {
  const state = { x: 0, y: 0, zoom: 1 };
  return {
    useViewportStore: vi.fn((selector) => (selector ? selector(state) : state)),
  };
});

vi.mock("../../state/shellStore", () => ({
  useShellStore: () => ({
    canvasId: "test-canvas",
  }),
}));

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

describe("Connection Handles Adversarial Tests", () => {
  afterEach(() => {
    cleanup();
  });

  it("adversarial: handles should remain visible (opacity-80) even when another block is hovered", () => {
    const mockObject = {
      id: "obj-1",
      type: "iem.agent.agent",
      x: 0,
      y: 0,
      width: 320,
      height: 240,
      zIndex: 1,
      status: "idle",
      metadata: {},
      blockKind: "agent",
    };

    render(<ObjectRenderer object={mockObject as any} />);

    const leftHandle = screen.getByTitle(/Input — connect upstream/i);
    expect(leftHandle.className).toContain("opacity-80");
  });

  it("adversarial: handles should render correctly for minimum dimension blocks", () => {
    const tinyObject = {
      id: "tiny-1",
      type: "iem.note",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      zIndex: 1,
      status: "idle",
      metadata: {},
      blockKind: "note",
    };

    render(<ObjectRenderer object={tinyObject as any} />);

    const leftHandle = screen.getByTitle(/Input — connect upstream/i);
    const rightHandle = screen.getByTitle(/Output — drag to connect/i);

    expect(leftHandle).toBeDefined();
    expect(rightHandle).toBeDefined();
  });
});
