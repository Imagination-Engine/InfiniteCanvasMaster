/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
});
