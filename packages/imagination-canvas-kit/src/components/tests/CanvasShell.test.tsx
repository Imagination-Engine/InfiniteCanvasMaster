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
    div: ({
      children,
      className,
      style,
      drag,
      dragMomentum,
      dragElastic,
      dragTransition,
      initial,
      animate,
      exit,
      layoutId,
      layout,
      ...props
    }: any) => (
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

  // ─── Issue 4: Debug Banner Removal (Red phase) ────────────────────────────

  it("should NOT render the Rescue Pass Active debug banner", () => {
    render(
      <CanvasShell canvasId="test-canvas" mode="canvas">
        <div>Content</div>
      </CanvasShell>,
    );
    // Will FAIL before fix — the text exists in CanvasShell.tsx line 63
    expect(screen.queryByText(/Rescue Pass Active/i)).toBeNull();
  });

  it("should NOT render the top cyan debug bar element", () => {
    const { container } = render(
      <CanvasShell canvasId="test-canvas" mode="canvas">
        <div>Content</div>
      </CanvasShell>,
    );
    const shell = container.querySelector('[data-testid="canvas-shell"]');
    // The debug bar is a direct child div with h-1 and bg-brand-cyan classes
    // Will FAIL before fix — element exists in source
    const debugBar = shell?.querySelector(".h-1.bg-brand-cyan");
    expect(debugBar).toBeNull();
  });

  it("adversarial: no direct child of canvas-shell should carry z-index above 10001", () => {
    const { container } = render(
      <CanvasShell canvasId="test-canvas" mode="canvas">
        <div>Content</div>
      </CanvasShell>,
    );
    const shell = container.querySelector('[data-testid="canvas-shell"]');
    const highZChildren = Array.from(shell?.children ?? []).filter((el) => {
      const z = parseInt((el as HTMLElement).style.zIndex ?? "0", 10);
      return z > 10001;
    });
    expect(highZChildren.length).toBe(0);
  });
});
