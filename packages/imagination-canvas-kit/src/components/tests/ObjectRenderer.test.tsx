/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ObjectRenderer } from "../ObjectRenderer";
import { BlockRegistry } from "../../contracts/BlockRegistry";

// Mock stores
vi.mock("../../state/selectionStore", () => ({
  useSelectionStore: () => ({
    selectedIds: [],
    setSelection: vi.fn(),
    setHovered: vi.fn(),
    hoveredId: null,
  }),
}));
vi.mock("../../state/expansionStore", () => ({
  useExpansionStore: () => ({
    setExpansion: vi.fn(),
  }),
}));

const mockViewportState = { x: 0, y: 0, zoom: 1 };
vi.mock("../../state/viewportStore", () => ({
  useViewportStore: (selector: any) =>
    selector ? selector(mockViewportState) : mockViewportState,
}));

vi.mock("../../state/canvasStore", () => ({
  useCanvasStore: () => ({
    updateObject: vi.fn(),
  }),
}));
vi.mock("../../state/connectionStore", () => ({
  useConnectionStore: () => ({
    addConnection: vi.fn(),
  }),
}));

describe("ObjectRenderer with BlockRegistry", () => {
  it("should resolve a component from the BlockRegistry using blockKind", () => {
    const MockComponent: React.FC<any> = () => (
      <div data-testid="mock-block">Mock Block</div>
    );
    BlockRegistry.register("custom-kind", MockComponent);

    const mockObject: any = {
      id: "obj-1",
      type: "block",
      blockKind: "custom-kind",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      zIndex: 1,
      metadata: {},
    };

    const { getByTestId } = render(<ObjectRenderer object={mockObject} />);
    expect(getByTestId("mock-block")).toBeTruthy();
  });
});
