/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";
import { useSelectionStore } from "../../state/selectionStore";
import { useCanvasStore } from "../../state/canvasStore";

describe("ObjectRenderer Body & Footer", () => {
  const mockObject = {
    id: "obj-1",
    type: "iem.agent.agent",
    x: 0,
    y: 0,
    width: 320,
    height: 240,
    zIndex: 1,
    status: "thinking",
    metadata: {
      label: "Test Agent",
      role: "Researcher",
      instructions: "Find market trends",
      capabilities: ["web_search", "file_read"],
    },
  };

  beforeEach(() => {
    useSelectionStore.setState({ selectedIds: [] });
    useCanvasStore.setState({ objects: { [mockObject.id]: mockObject } });
  });

  afterEach(() => {
    cleanup();
  });

  it("should render role and status line in the chrome", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    // Expect to see the role in the body metadata section
    expect(screen.getByText(/Researcher/i)).toBeDefined();

    // Expect to see the status line (e.g. thinking) in the chrome
    expect(screen.getByText(/thinking/i)).toBeDefined();
  });

  it("should render capability chips (max 2) in the footer", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    expect(screen.getByText(/web_search/i)).toBeDefined();
    expect(screen.getByText(/file_read/i)).toBeDefined();
  });

  it("should render a human-in-the-loop indicator when status is 'waiting-for-user'", () => {
    const waitingObject = { ...mockObject, status: "waiting-for-user" };
    useCanvasStore.setState({ objects: { [waitingObject.id]: waitingObject } });

    render(<ObjectRenderer object={waitingObject as any} />);

    expect(screen.getByTestId("hitl-indicator")).toBeDefined();
  });
});
