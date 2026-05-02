/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";
import { TopWorkspaceBar } from "../TopWorkspaceBar";
import { BottomCommandZone } from "../BottomCommandZone";

expect.extend(matchers);

describe("Shell Regions", () => {
  afterEach(() => {
    cleanup();
  });

  describe("TopWorkspaceBar", () => {
    it("should render workspace and canvas titles", () => {
      render(
        <TopWorkspaceBar
          workspaceName="My Workspace"
          canvasTitle="My Canvas"
        />,
      );
      expect(screen.getByText("My Workspace")).toBeInTheDocument();
      expect(screen.getByText("My Canvas")).toBeInTheDocument();
    });

    it("should show sync status", () => {
      render(<TopWorkspaceBar syncStatus="synced" />);
      expect(screen.getByText(/synced/i)).toBeInTheDocument();
    });
  });

  describe("BottomCommandZone", () => {
    it("should render contextual hints", () => {
      render(<BottomCommandZone hint="Select an object to edit" />);
      expect(screen.getByText("Select an object to edit")).toBeInTheDocument();
    });

    it("should render AI input when selected", () => {
      render(<BottomCommandZone showAiInput={true} />);
      expect(screen.getByPlaceholderText(/Ask AI/i)).toBeInTheDocument();
    });
  });
});
