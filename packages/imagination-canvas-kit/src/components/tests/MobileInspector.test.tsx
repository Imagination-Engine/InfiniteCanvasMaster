// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { MobileInspector } from "../MobileInspector";

describe("MobileInspector", () => {
  it("should render a bottom sheet when screen width is < 768px", () => {
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { getByText, container } = render(
      <MobileInspector isOpen={true} onClose={() => {}} />,
    );

    // Check if it renders
    expect(getByText("Inspector")).toBeDefined();

    // Verify it acts as a bottom sheet (e.g. checks class or inline styles)
    const sheet = container.querySelector(".bottom-sheet") as HTMLElement;
    expect(sheet).toBeDefined();
    expect(sheet.style.bottom).toBe("0px"); // A typical bottom sheet style
  });

  it("should not render when isOpen is false", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    const { container } = render(
      <MobileInspector isOpen={false} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should NOT render the mobile bottom sheet when screen width is >= 768px", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    const { container } = render(
      <MobileInspector isOpen={true} onClose={() => {}} />,
    );

    // It should render null or delegate to RightInspector.
    // If it's strictly a MobileInspector component, it might just return null here.
    expect(container.querySelector(".bottom-sheet")).toBeNull();
  });
});
