// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useExpansionStore } from "../expansionStore";

describe("Expansion Store", () => {
  beforeEach(() => {
    useExpansionStore.setState({ activeExpansionId: null, activeMode: "none" });
  });

  it("should set expansion state", () => {
    const { setExpanded } = useExpansionStore.getState();
    setExpanded("app-1", "fullscreen");

    const state = useExpansionStore.getState();
    expect(state.activeExpansionId).toBe("app-1");
    expect(state.activeMode).toBe("fullscreen");
  });

  it("should clear expansion state", () => {
    const { setExpanded, clearExpanded } = useExpansionStore.getState();
    setExpanded("app-1", "fullscreen");
    clearExpanded();

    const state = useExpansionStore.getState();
    expect(state.activeExpansionId).toBeNull();
    expect(state.activeMode).toBe("none");
  });

  describe("adversarial cases", () => {
    it("should overwrite existing expansion state to prevent dual-expansions", () => {
      const { setExpanded } = useExpansionStore.getState();

      setExpanded("app-1", "side-panel");
      setExpanded("app-2", "fullscreen");

      const state = useExpansionStore.getState();
      expect(state.activeExpansionId).toBe("app-2");
      expect(state.activeMode).toBe("fullscreen");
      // Ensure app-1 is no longer expanded
      expect(state.activeExpansionId).not.toBe("app-1");
    });
  });
});
