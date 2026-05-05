/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { InfiniteViewport } from "../InfiniteViewport";
import { useCanvasStore } from "../../state/canvasStore";
import { useSelectionStore } from "../../state/selectionStore";

describe("InfiniteViewport Drop Handling", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: {} });
    useSelectionStore.setState({ selectedIds: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("should add and select a block on drop", () => {
    // Mock getBoundingClientRect
    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return {
        width: 1000,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 1000,
        right: 1000,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    };

    render(<InfiniteViewport />);

    const viewport = screen.getByTestId("infinite-viewport");

    const dataTransfer = {
      getData: (type: string) => {
        if (type === "text/plain") return "note";
        if (type === "application/reactflow") return "note";
        return "";
      },
      dropEffect: "",
    };

    fireEvent.drop(viewport, {
      clientX: 500,
      clientY: 500,
      dataTransfer,
    });

    const objects = useCanvasStore.getState().objects;
    const objectValues = Object.values(objects);
    expect(objectValues.length).toBe(1);
    expect(objectValues[0].type).toBe("note");

    const selectedIds = useSelectionStore.getState().selectedIds;
    expect(selectedIds).toContain(objectValues[0].id);

    // Restore mock
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
});
