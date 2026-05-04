/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { TransformHandle } from "../TransformHandle";

describe("TransformHandle", () => {
  it("should render an invisible padding wrapper of at least 44px for touch targets", () => {
    const { container } = render(
      <TransformHandle position="top-left" onDragStart={() => {}} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeDefined();

    // Check if the wrapper enforces the 44px rule
    const style = window.getComputedStyle(wrapper);
    // Since jsdom doesn't fully compute layouts, we can check inline styles or classes
    // We expect the implementation to set width/height to 44px on the outer wrapper
    expect(wrapper.style.width).toBe("44px");
    expect(wrapper.style.height).toBe("44px");

    // Check for the inner visible handle
    const innerHandle = wrapper.querySelector(".visible-handle") as HTMLElement;
    expect(innerHandle).toBeDefined();
    // Inner handle is usually smaller, e.g., 10px or 12px
  });
});
