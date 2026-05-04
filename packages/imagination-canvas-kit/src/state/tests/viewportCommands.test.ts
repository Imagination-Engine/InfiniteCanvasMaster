// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useViewportStore } from "../viewportStore";
import { useCanvasStore } from "../canvasStore";

describe("Viewport Commands", () => {
  beforeEach(() => {
    useViewportStore.setState({
      x: 0,
      y: 0,
      zoom: 1,
      width: 1000,
      height: 1000,
    });
    useCanvasStore.setState({ objects: [] });
  });

  it("should calculate bounding box and fit to content", () => {
    const { addObject } = useCanvasStore.getState();
    addObject({
      id: "1",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      type: "block",
    } as any);
    addObject({
      id: "2",
      x: 400,
      y: 400,
      width: 100,
      height: 100,
      type: "block",
    } as any);

    const { fitToContent } = useViewportStore.getState();
    fitToContent();

    const state = useViewportStore.getState();
    // Bounding box: (100,100) to (500,500) -> Size: 400x400
    // Centered in 1000x1000 viewport.
    expect(state.zoom).toBeLessThan(2.5); // Should zoom out to fit
    expect(state.zoom).toBeGreaterThan(0.1);
  });

  it("should zoom to selection", () => {
    const { addObject } = useCanvasStore.getState();
    addObject({
      id: "1",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      type: "block",
    } as any);

    const { zoomToSelection } = useViewportStore.getState();
    zoomToSelection(["1"]);

    const state = useViewportStore.getState();
    expect(state.zoom).toBeGreaterThan(1); // Should zoom in on small object
  });
});
