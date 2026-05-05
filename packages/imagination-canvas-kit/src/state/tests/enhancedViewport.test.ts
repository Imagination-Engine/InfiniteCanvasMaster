// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useViewportStore } from "../viewportStore";

describe("Enhanced Viewport Store", () => {
  beforeEach(() => {
    useViewportStore.setState({
      x: 0,
      y: 0,
      zoom: 1,
      mode: "free",
      previous: undefined,
    });
  });

  it("should support mode transitions", () => {
    const { setMode } = useViewportStore.getState();
    setMode("focus");

    const state = useViewportStore.getState();
    expect(state.mode).toBe("focus");
  });

  it("should record previous state when focusing", () => {
    const { focusOn } = useViewportStore.getState();

    // Initial state: x:0, y:0, zoom:1
    focusOn({ x: 100, y: 100, zoom: 2 }, "test focus");

    const state = useViewportStore.getState();
    expect(state.x).toBe(100);
    expect(state.mode).toBe("focus");
    expect(state.previous).toBeDefined();
    expect(state.previous?.x).toBe(0);
    expect(state.previous?.reason).toBe("test focus");
  });

  it("should return to previous state", () => {
    const { focusOn, returnToPrevious } = useViewportStore.getState();

    focusOn({ x: 500, y: 500, zoom: 0.5 }, "zoom out");
    returnToPrevious();

    const state = useViewportStore.getState();
    expect(state.x).toBe(0);
    expect(state.y).toBe(0);
    expect(state.zoom).toBe(1);
    expect(state.mode).toBe("free");
    expect(state.previous).toBeUndefined();
  });

  it("adversarial: should not crash if returning when no previous state exists", () => {
    const { returnToPrevious } = useViewportStore.getState();
    expect(() => returnToPrevious()).not.toThrow();
  });
});
