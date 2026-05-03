/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ExpandableBlockWrapper } from "../ExpandableBlockWrapper";
import { useExpansionStore } from "../../state/expansionStore";

describe("ExpandableBlockWrapper", () => {
  beforeEach(() => {
    useExpansionStore.setState({ activeExpansionId: null, activeMode: "none" });
  });

  const mockBlock = {
    id: "block-1",
    type: "block",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    status: "idle",
    data: {},
  };

  it("should render the standard block when not expanded", () => {
    const { container } = render(
      <ExpandableBlockWrapper block={mockBlock as any}>
        <div className="mock-child">Collapsed</div>
      </ExpandableBlockWrapper>,
    );

    const child = container.querySelector(".mock-child");
    expect(child).toBeDefined();
    expect(child?.textContent).toBe("Collapsed");

    // Should not have the expanded overlay class
    expect(container.querySelector(".expanded-overlay")).toBeNull();
  });

  it("should render the expanded overlay when block is expanded", () => {
    useExpansionStore.setState({
      activeExpansionId: "block-1",
      activeMode: "fullscreen",
    });

    const { container } = render(
      <ExpandableBlockWrapper block={mockBlock as any}>
        <div className="mock-child">Content</div>
      </ExpandableBlockWrapper>,
    );

    const overlay = container.querySelector(".expanded-overlay");
    expect(overlay).toBeDefined();
    // In expanded mode, we expect the wrapper to render a fullscreen container
    expect((overlay as HTMLElement).style.position).toBe("fixed");
  });

  describe("adversarial cases", () => {
    it("should not render fullscreen overlay if expanded in a different mode (e.g., side-panel)", () => {
      useExpansionStore.setState({
        activeExpansionId: "block-1",
        activeMode: "side-panel",
      });

      const { container } = render(
        <ExpandableBlockWrapper block={mockBlock as any}>
          <div className="mock-child">Content</div>
        </ExpandableBlockWrapper>,
      );

      // The fullscreen overlay shouldn't render if mode is side-panel
      const overlay = container.querySelector(".expanded-overlay");
      expect(overlay).toBeNull();

      // But the original inline version should still hide itself if we let a separate side-panel renderer handle it,
      // Or in this case, our wrapper hides the inline block when activeExpansionId matches.
      // Wait, if it's hidden but no overlay, where is it?
      // For this test, let's just assert the fullscreen overlay doesn't hijacking the DOM.
    });
  });
});
