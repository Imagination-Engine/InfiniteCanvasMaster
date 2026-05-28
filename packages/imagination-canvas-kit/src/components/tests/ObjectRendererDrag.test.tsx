/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";
import { useSelectionStore } from "../../state/selectionStore";
import { useCanvasStore } from "../../state/canvasStore";

describe("ObjectRenderer Drag Interaction", () => {
  const mockObject = {
    id: "obj-1",
    type: "iem.agent.agent",
    x: 100,
    y: 100,
    width: 320,
    height: 240,
    zIndex: 1,
    status: "idle",
    metadata: { label: "Test Agent" },
    capabilities: [],
    blockKind: "agent",
  };

  beforeEach(() => {
    useSelectionStore.setState({ selectedIds: [] });
    useCanvasStore.setState({
      objects: { [mockObject.id]: mockObject as any },
    });
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => cb(0));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should update coordinates in store during drag", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    // Search for the element that contains the label
    const block = screen.getByText(/Test Agent/i).closest(".absolute");
    expect(block).toBeDefined();

    // Start drag
    fireEvent.pointerDown(block!, { clientX: 100, clientY: 100 });

    // Move
    fireEvent.pointerMove(window, { clientX: 150, clientY: 150 });

    const updatedObject = useCanvasStore.getState().objects["obj-1"];
    // dx = 150 - 100 = 50. New X = 100 + 50 = 150.
    expect(updatedObject.x).toBe(150);
    expect(updatedObject.y).toBe(150);

    // End drag
    fireEvent.pointerUp(window);
  });
});
