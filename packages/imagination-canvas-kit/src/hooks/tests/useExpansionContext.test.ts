// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useExpansionContext } from "../useExpansionContext";
import { useViewportStore } from "../../state/viewportStore";
import { useExpansionStore } from "../../state/expansionStore";
import { renderHook, act } from "@testing-library/react";

describe("useExpansionContext", () => {
  beforeEach(() => {
    useViewportStore.setState({
      x: 100,
      y: 200,
      zoom: 1.5,
      previous: undefined,
      mode: "free",
    });
    useExpansionStore.setState({ activeExpansionId: null, activeMode: "none" });
  });

  it("should push camera state when expanding", () => {
    const { result } = renderHook(() => useExpansionContext());
    const { triggerExpansion } = result.current;

    act(() => {
      triggerExpansion("app-block-1", "fullscreen");
    });

    const viewport = useViewportStore.getState();
    const expansion = useExpansionStore.getState();

    // Check expansion state
    expect(expansion.activeExpansionId).toBe("app-block-1");
    expect(expansion.activeMode).toBe("fullscreen");

    // Check viewport state
    expect(viewport.mode).toBe("focus");
    expect(viewport.previous).toBeDefined();
    expect(viewport.previous?.x).toBe(100);
    expect(viewport.previous?.y).toBe(200);
    expect(viewport.previous?.zoom).toBe(1.5);
  });

  it("should pop camera state when closing expansion", () => {
    const { result } = renderHook(() => useExpansionContext());
    const { triggerExpansion, closeExpansion } = result.current;

    act(() => {
      triggerExpansion("app-block-1", "fullscreen");
    });

    // Simulate some panning while "expanded" just in case
    useViewportStore.getState().pan(50, 50);

    act(() => {
      closeExpansion();
    });

    const viewport = useViewportStore.getState();
    const expansion = useExpansionStore.getState();

    expect(expansion.activeExpansionId).toBeNull();
    expect(expansion.activeMode).toBe("none");

    // It should have returned to the original position
    expect(viewport.mode).toBe("free");
    expect(viewport.x).toBe(100);
    expect(viewport.y).toBe(200);
    expect(viewport.zoom).toBe(1.5);
    expect(viewport.previous).toBeUndefined();
  });

  describe("adversarial cases", () => {
    it("should not crash if closing when nothing is expanded", () => {
      const { result } = renderHook(() => useExpansionContext());
      const { closeExpansion } = result.current;

      // Current state has no previous because we didn't trigger expansion
      act(() => {
        closeExpansion();
      });

      const viewport = useViewportStore.getState();
      const expansion = useExpansionStore.getState();

      // State should remain stable, not throw
      expect(expansion.activeExpansionId).toBeNull();
      expect(viewport.mode).toBe("free"); // Or whatever it was before
    });

    it("should overwrite previous state correctly if triggerExpansion is called multiple times", () => {
      const { result } = renderHook(() => useExpansionContext());
      const { triggerExpansion, closeExpansion } = result.current;

      act(() => {
        triggerExpansion("app-block-1", "fullscreen");
      });

      // User pans while expanded (simulate)
      act(() => {
        useViewportStore.getState().pan(50, 50);
      });

      // Triggering another expansion without closing first
      act(() => {
        triggerExpansion("app-block-2", "side-panel");
      });

      const viewport = useViewportStore.getState();
      // The previous state is now the state *after* the pan (150, 250)
      expect(viewport.previous?.x).toBe(150);
      expect(viewport.previous?.y).toBe(250);

      act(() => {
        closeExpansion();
      });

      // It should return to 150, 250, not the original 100, 200
      expect(useViewportStore.getState().x).toBe(150);
    });
  });
});
