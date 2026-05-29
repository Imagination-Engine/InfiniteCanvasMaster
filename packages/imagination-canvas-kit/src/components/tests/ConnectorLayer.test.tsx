/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { ConnectorLayer } from "../ConnectorLayer";
import { useConnectionStore } from "../../state/connectionStore";
import { useCanvasStore } from "../../state/canvasStore";

describe("ConnectorLayer", () => {
  const mockObjects = {
    "obj-1": { id: "obj-1", x: 0, y: 0, width: 100, height: 100 },
    "obj-2": { id: "obj-2", x: 500, y: 0, width: 100, height: 100 },
  };

  const mockConnection = {
    id: "edge-1",
    fromId: "obj-1",
    toId: "obj-2",
  };

  beforeEach(() => {
    useCanvasStore.setState({ objects: mockObjects as any });
    useConnectionStore.setState({
      connections: { [mockConnection.id]: mockConnection },
      draftConnection: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should render SVG paths for connections", () => {
    const { container } = render(<ConnectorLayer />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });

  it("should include directional markers (arrows)", () => {
    const { container } = render(<ConnectorLayer />);
    const marker = container.querySelector("marker");
    expect(marker).toBeDefined();
    expect(marker?.id).toBe("arrowhead");
  });

  it("should render a draft spline when draftConnection is active", () => {
    useConnectionStore.setState({
      draftConnection: {
        fromId: "obj-1",
        x: 300,
        y: 200,
      },
    });

    const { container } = render(<ConnectorLayer />);
    const draftPath = container.querySelector('path[stroke-dasharray="5 5"]');
    expect(draftPath).not.toBeNull();
  });

  it("should render the delete button on mouse enter and call removeConnection on click", () => {
    const { container } = render(<ConnectorLayer />);
    const edgeGroup = container.querySelector(".group\\/edge");
    expect(edgeGroup).not.toBeNull();

    // Trigger mouse enter to show the delete button
    fireEvent.mouseEnter(edgeGroup!);

    // Now the delete button should be visible
    const deleteBtn = container.querySelector('g[class*="cursor-pointer"]');
    expect(deleteBtn).not.toBeNull();

    // Click it!
    fireEvent.click(deleteBtn!);

    // The connections in the store should now be empty!
    const connections = useConnectionStore.getState().connections;
    expect(connections).toEqual({});
  });
});
