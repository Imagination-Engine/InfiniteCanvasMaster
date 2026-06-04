/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";

// Mock stores
const mockAddConnection = vi.fn();
const mockSetDraftConnection = vi.fn();
const mockUpdateDraftPosition = vi.fn();

vi.mock("../../state/connectionStore", () => ({
  useConnectionStore: (selector: any) => {
    const state = {
      connections: {},
      addConnection: mockAddConnection,
      draftConnection: null,
      setDraftConnection: mockSetDraftConnection,
      updateDraftPosition: mockUpdateDraftPosition,
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
      type: "note",
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

vi.mock("@iem/core", () => ({
  studioInteropResolver: {
    canConnectBlocks: () => true,
  },
  normalizeCanvasBlockId: (id: string) => id,
  blockRegistry: {
    get: () => ({ name: "Note", width: 100, height: 100 }),
  },
}));

describe("Connection Routing", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should create a connection when dragging from output handle of one node to another node", () => {
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
      type: "note",
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

    const outputHandles = screen.getAllByTitle(/Output — drag to connect/i);
    const outputHandleObj1 = outputHandles[0];

    // Simulating drag and drop
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn((key) =>
        key === "application/iem-connection" ? "obj-1" : "",
      ),
      types: ["application/iem-connection"],
    };

    fireEvent.dragStart(outputHandleObj1, { dataTransfer });

    const obj2Label = screen.getByText("obj-2");
    const obj2Container = obj2Label.closest(".cursor-grab");
    fireEvent.drop(obj2Container!, { dataTransfer });

    expect(mockAddConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        fromId: "obj-1",
        toId: "obj-2",
      }),
    );
  });

  it("should set draft connection on drag start and clear it on drag end", () => {
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

    fireEvent.dragStart(outputHandle, { dataTransfer: { setData: vi.fn() } });

    // This should fail as currently setDraftConnection is NOT called in ObjectRenderer
    expect(mockSetDraftConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        fromId: "obj-1",
      }),
    );

    fireEvent.dragEnd(outputHandle);
    expect(mockSetDraftConnection).toHaveBeenCalledWith(null);
  });

  it("should create a connection when dragging from target (input) handle of one node and dropping on a source (output) node", () => {
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
      type: "note",
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

    const inputHandles = screen.getAllByTitle(/Input — connect upstream/i);
    const inputHandleObj2 = inputHandles[1];

    // Simulating drag and drop starting from the target/input handle of obj-2
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn((key) => {
        if (key === "application/iem-connection") return "obj-2";
        if (key === "application/iem-connection-type") return "target";
        return "";
      }),
      types: ["application/iem-connection", "application/iem-connection-type"],
    };

    fireEvent.dragStart(inputHandleObj2, { dataTransfer });

    const obj1Label = screen.getByText("obj-1");
    const obj1Container = obj1Label.closest(".cursor-grab");
    fireEvent.drop(obj1Container!, { dataTransfer });

    // Since we dragged from target (obj-2) to source (obj-1), the connection should go from obj-1 to obj-2
    expect(mockAddConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        fromId: "obj-1",
        toId: "obj-2",
      }),
    );
  });

  it("should set draft connection type to target on drag start from input handle", () => {
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

    const inputHandle = screen.getByTitle(/Input — connect upstream/i);

    fireEvent.dragStart(inputHandle, { dataTransfer: { setData: vi.fn() } });

    expect(mockSetDraftConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        fromId: "obj-1",
        type: "target",
      }),
    );

    fireEvent.dragEnd(inputHandle);
    expect(mockSetDraftConnection).toHaveBeenCalledWith(null);
  });
});
