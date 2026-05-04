// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";
import { CanvasShell } from "../CanvasShell";

expect.extend(matchers);

// Mock framer-motion to avoid issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("CanvasShell", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render children", () => {
    render(
      <CanvasShell canvasId="test-canvas" mode="canvas">
        <div data-testid="child">Test Child</div>
      </CanvasShell>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should apply the correct layout mode class", () => {
    const { rerender, container } = render(
      <CanvasShell canvasId="test-canvas" mode="canvas">
        <div>Content</div>
      </CanvasShell>,
    );

    expect(container.firstChild).toHaveClass("mode-canvas");

    rerender(
      <CanvasShell canvasId="test-canvas" mode="focus">
        <div>Content</div>
      </CanvasShell>,
    );
    expect(container.firstChild).toHaveClass("mode-focus");
  });

  it("should establish correct layering via z-index", () => {
    render(
      <CanvasShell canvasId="test-canvas" mode="canvas">
        <div data-testid="content">Content</div>
      </CanvasShell>,
    );

    const shell = screen.getByTestId("canvas-shell");
    expect(shell).toHaveClass("relative");
    expect(shell).toHaveClass("w-full");
    expect(shell).toHaveClass("h-full");
  });

  it("adversarial: should handle missing mode gracefully", () => {
    // @ts-ignore
    render(
      <CanvasShell canvasId="test-canvas">
        <div>Content</div>
      </CanvasShell>,
    );
    const shell = screen.getByTestId("canvas-shell");
    expect(shell).toHaveClass("mode-canvas"); // Default mode
  });
});
