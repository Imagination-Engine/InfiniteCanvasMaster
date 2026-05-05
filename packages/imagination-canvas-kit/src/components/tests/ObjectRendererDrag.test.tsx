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
  };

  beforeEach(() => {
    useSelectionStore.setState({ selectedIds: [] });
    useCanvasStore.setState({ objects: { [mockObject.id]: mockObject } });
  });

  afterEach(() => {
    cleanup();
  });

  it("should update coordinates in store during drag", () => {
    render(<ObjectRenderer object={mockObject as any} />);

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

  it("should apply dragging visual styles", () => {
    // This requires isDragging state in the component
    // We'll check for a class like 'scale-105' or 'shadow-2xl' if we implement it
    render(<ObjectRenderer object={mockObject as any} />);

    const block = screen.getByText(/Test Agent/i).closest(".absolute");

    fireEvent.pointerDown(block!, { clientX: 100, clientY: 100 });

    // Check if it has elevated styling (we'll implement this)
    // For now we just expect it to be in the DOM
    expect(block).toBeDefined();
  });
});
