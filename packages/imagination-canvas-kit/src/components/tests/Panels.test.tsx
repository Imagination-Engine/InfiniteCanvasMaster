/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";
import { LeftToolDock } from "../LeftToolDock";
import { RightInspector } from "../RightInspector";

expect.extend(matchers);

// Mock framer-motion
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

describe("Shell Panels", () => {
  afterEach(() => {
    cleanup();
  });

  describe("LeftToolDock", () => {
    it("should render tool buttons", () => {
      render(<LeftToolDock />);
      expect(
        screen.getByRole("button", { name: /select/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hand/i })).toBeInTheDocument();
    });
  });

  describe("RightInspector", () => {
    it("should render when isOpen is true", () => {
      render(<RightInspector isOpen={true} title="Properties" />);
      expect(screen.getByText("Properties")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<RightInspector isOpen={false} title="Properties" />);
      expect(screen.queryByText("Properties")).not.toBeInTheDocument();
    });
  });
});
