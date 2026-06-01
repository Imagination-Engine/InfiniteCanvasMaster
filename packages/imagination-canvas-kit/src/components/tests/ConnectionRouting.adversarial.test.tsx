/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";

// Mock stores
const mockAddConnection = vi.fn();
vi.mock("../../state/connectionStore", () => ({
  useConnectionStore: (selector: any) => {
    const state = {
      connections: {},
      addConnection: mockAddConnection,
      setDraftConnection: vi.fn(),
      updateDraftPosition: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

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

const mockCanvasState = {
  objects: {
    "obj-1": {
      id: "obj-1",
      type: "note",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      metadata: { label: "obj-1" },
    },
    "obj-2": {
      id: "obj-2",
      type: "invalid-type",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      metadata: { label: "obj-2" },
    },
  },
  updateObject: vi.fn(),
  removeObject: vi.fn(),
  patchObjectMetadata: vi.fn(),
};

vi.mock("../../state/canvasStore", () => {
  const useCanvasStoreMock = vi.fn((selector: any) =>
    selector ? selector(mockCanvasState) : mockCanvasState,
  );
  (useCanvasStoreMock as any).getState = () => mockCanvasState;
  return { useCanvasStore: useCanvasStoreMock };
});

vi.mock("../../hooks/useCanvasHistory", () => ({
  useCanvasHistory: () => ({
    capture: vi.fn(),
  }),
}));

const mockCanConnectBlocks = vi.fn((src, target) => target !== "invalid-type");
vi.mock("@iem/core", () => ({
  studioInteropResolver: {
    canConnectBlocks: (src: any, target: any) =>
      mockCanConnectBlocks(src, target),
  },
  normalizeCanvasBlockId: (id: string) => id,
  blockRegistry: {
    get: () => ({ name: "Note", width: 100, height: 100 }),
  },
}));

describe("Connection Routing Adversarial", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("adversarial: should NOT create a connection to itself", () => {
    const obj1 = {
      id: "obj-1",
      type: "note",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      metadata: { label: "obj-1" },
      status: "idle",
    };

    render(<ObjectRenderer object={obj1 as any} />);

    const outputHandle = screen.getByTitle(/Output — drag to connect/i);
    const container = screen.getByText("obj-1").closest(".cursor-grab");

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn((key) =>
        key === "application/iem-connection" ? "obj-1" : "",
      ),
      types: ["application/iem-connection"],
    };

    fireEvent.dragStart(outputHandle, { dataTransfer });
    fireEvent.drop(container!, { dataTransfer });

    expect(mockAddConnection).not.toHaveBeenCalled();
  });

  it("adversarial: should NOT create a connection to incompatible types", () => {
    const obj1 = {
      id: "obj-1",
      type: "note",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      metadata: { label: "obj-1" },
      status: "idle",
    };
    const obj2 = {
      id: "obj-2",
      type: "invalid-type",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      metadata: { label: "obj-2" },
      status: "idle",
    };

    render(
      <>
        <ObjectRenderer object={obj1 as any} />
        <ObjectRenderer object={obj2 as any} />
      </>,
    );

    const outputHandleObj1 = screen.getAllByTitle(
      /Output — drag to connect/i,
    )[0];
    const obj2Container = screen.getByText("obj-2").closest(".cursor-grab");

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn((key) =>
        key === "application/iem-connection" ? "obj-1" : "",
      ),
      types: ["application/iem-connection"],
    };

    fireEvent.dragStart(outputHandleObj1, { dataTransfer });
    fireEvent.drop(obj2Container!, { dataTransfer });

    expect(mockAddConnection).not.toHaveBeenCalled();
  });
});
